const mongoose = require("mongoose");
const moment = require("moment");
const Level = require("../model/levelModel");
const User = require("../model/userModel");
const Contact = require("../model/contactModel");
const Church = require("../model/churchModel");
const Role = require("../model/roleModel");
const { logger } = require("../utils/logger");
const AppError = require("../utils/appError");
const MemberService = require("./member.service");
const { defaultRoles } = require("../utils/permissions");

const createDefaultRoles = async (churchId, isHQ, session) => {
  const roles = defaultRoles(isHQ, churchId);

  const createdRoles = await Role.create(roles, { session });
  return createdRoles;
};

const createChurch = async (churchData, session) => {
  const church = await Church.create([churchData], { session });
  return church[0];
};

const createChurchOnBoardingService = async (memberData, churchData, req) => {
  const userDetails = req.user;
  // check for duplicate data
  // first the church data
  const churchAlreadyExists = await Church.findOne({
    $or: [
      { "contact.email": churchData.email },
      { "contact.phone": churchData.phone },
    ],
  });
  if (churchAlreadyExists) {
    throw new AppError("Church Email or Phone already exists", 400);
  }

  // check for duplicate member data
  const memberAlreadyExists = await Contact.findOne({
    $or: [
      { "profile.email": memberData.email },
      { "profile.phone.mainPhone": memberData.phone },
    ],
  });
  if (memberAlreadyExists) {
    throw new AppError("Member Email or Phone already exists", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: userId } = req.user;
    if (!userId) {
      throw new AppError("Missing user information for church creation", 400);
    }

    // check the church email or phone number exists
    const churchExists = await Church.findOne({
      $or: [
        { "contact.email": churchData.email },
        { "contact.phone": churchData.phone },
      ],
    });

    if (churchExists) {
      throw new AppError("Church already exists", 400);
    }

    let church;
    if (!churchData.hasParentChurch) {
      // check if the user is already has a main church
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      if (user.mainChurch) {
        throw new AppError("User is can't create any HQ Church", 400);
      }

      const newLevel = new Level({
        name: "HQ",
        ownedBy: "60f3b3b3e6b3f3b3b3e6b3f3",
        order: 0,
        parentLevel: null,
      });

      church = await createChurch(
        {
          name: churchData.name,
          isHQ: true,
          level: newLevel._id,
          parentChurch: null,
          location: {
            address: churchData.address,
            city: churchData.city,
            state: churchData.state,
            country: churchData.country,
            postalCode: churchData.postalCode,
          },
          contact: {
            email: churchData.email,
            phone: churchData.phone,
          },
          settings: {
            website: churchData.website,
            logo: churchData.logo,
          },
        },
        session,
      );

      newLevel.ownedBy = church._id.toString();
      await newLevel.save({ session });
    } else {
      const { levelId } = churchData;
      if (!levelId) {
        throw new AppError("Missing level ID for non-HQ church", 400);
      }

      const level = await Level.findById(levelId);
      if (!level) {
        throw new AppError(`Invalid level ID: ${levelId}`, 400);
      }

      church = await createChurch(
        {
          name: churchData.name,
          isHQ: false,
          level: levelId,
          parentChurch: churchData.parentChurch,
          location: {
            address: churchData.address,
            city: churchData.city,
            state: churchData.state,
            country: churchData.country,
            postalCode: churchData.postalCode,
          },
          contact: {
            email: churchData.email,
            phone: churchData.phone,
          },
          settings: {
            website: churchData.website,
            logo: churchData.logo,
          },
        },
        session,
      );
    }

    const createdRoles = await createDefaultRoles(
      church._id,
      !churchData.hasParentChurch,
      session,
    );

    await User.findByIdAndUpdate(
      userId,
      { $set: { mainChurch: church._id, churches: [church._id] } },
      { session },
    );

    const member = await MemberService.createMemberOnboarding(
      memberData,
      church._id.toString(),
      userId,
      userDetails,
      createdRoles,
      session,
    );

    logger.info(`Church created with ID: ${church._id}`);
    await session.commitTransaction();
    session.endSession();
    return {
      member,
      church,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.message.includes("duplicate key error")) {
      throw new AppError(
        "Either the email or phone number of the contact already exists",
        400,
      );
    }
    logger.error(`Error creating church: ${error}`);
    throw error;
  }
};

class ChurchService {
  static async createChurchOnBoarding(memberData, churchData, req) {
    return await createChurchOnBoardingService(memberData, churchData, req);
  }

  static async findChurchById(id) {
    try {
      const church = await Church.findById(id);
      if (!church) {
        throw new AppError("Church not found", 404);
      }
      logger.info(`Church found with ID: ${id}`);
      return church;
    } catch (error) {
      logger.error(`Error finding church by ID: ${error.message}`);
      throw error;
    }
  }

  static async getAllHQ() {
    try {
      const churches = await Church.find({ isHQ: true });
      logger.info("HQ churches found");
      return churches;
    } catch (error) {
      logger.error(`Error finding HQ churches: ${error.message}`);
      throw error;
    }
  }

  static async getChurchesByLevel(levelId) {
    try {
      const churches = await Church.find({ level: levelId });
      logger.info("Churches found by level");
      return churches;
    } catch (error) {
      logger.error(`Error finding churches by level: ${error.message}`);
      throw error;
    }
  }

  static async updateChurch(churchId, data) {
    const session = await mongoose.startSession();
    session.startTransaction();
    let church;
    try {
      church = await Church.findByIdAndUpdate(churchId, data, {
        new: true,
        session,
      })
        .select("-__v -isHQ -isDeleted")
        .populate({
          path: "level",
          select: "name order -_id", // Include 'name' and 'order', exclude '_id'
        })
        .populate("parentChurch", "name");
      if (!church) {
        throw new AppError("Church not found", 404);
      }

      await session.commitTransaction();
      session.endSession();
      return church;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`Error updating church: ${error.message}`);
      throw error;
    }
  }

  // TODO: Wait For Proper Modificatio
  static async deleteChurch(churchId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const church = await Church.findByIdAndDelete(churchId, { session });
      if (!church) {
        throw new AppError("Church not found", 404);
      }

      await User.updateMany(
        { mainChurch: churchId },
        { $set: { mainChurch: null } },
        { session },
      );

      // update the churches array of the user
      await User.updateMany(
        { churches: churchId },
        { $pull: { churches: churchId } },
        { session },
      );

      await session.commitTransaction();
      session.endSession();
      return church;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`Error deleting church: ${error.message}`);
      throw error;
    }
  }

  static async getMembersJoinedStats(churchId, dateParam) {
    try {
      const church = await Church.findById(churchId);

      // Define date ranges
      const now = moment();
      const dateRanges = {
        lastWeek: {
          start: moment().subtract(1, "weeks").startOf("isoWeek").toDate(),
          end: moment().subtract(1, "weeks").endOf("isoWeek").toDate(),
        },
        lastMonth: {
          start: moment().subtract(1, "months").startOf("month").toDate(),
          end: moment().subtract(1, "months").endOf("month").toDate(),
        },
        lastQuarter: {
          start: moment().subtract(1, "quarters").startOf("quarter").toDate(),
          end: moment().subtract(1, "quarters").endOf("quarter").toDate(),
        },
        today: {
          start: moment(church.createdAt).toDate(),
          end: now.toDate(),
        },
      };

      const dateRange = dateRanges[dateParam] || dateRanges.today;

      // Query based on date range
      const membersJoined = await Contact.find({
        churchId,
        isDeleted: false,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      }).select(
        "profile.firstName profile.lastName _id profile.email profile.phone.mainPhone profile.dateOfBirth profile.gender profile.maritalStatus createdAt contactType profile.photo profile.anniversaries verification profile.active",
      );

      // Process and return results (remaining code unchanged)
      const members = membersJoined
        .filter((member) => member.contactType === "member")
        .map(
          ({
            _id: id,
            profile: {
              firstName,
              lastName,
              gender,
              email,
              phone: { mainPhone: phone },
              dateOfBirth,
              maritalStatus,
              anniversaries,
            },
            age,
            createdAt: dateJoined,
          }) => ({
            id,
            firstName,
            lastName,
            gender,
            email,
            phone,
            dateOfBirth,
            maritalStatus,
            anniversaries,
            age,
            dateJoined,
          }),
        );

      // unverified members and verified members, contactType === members
      const unverifiedMembers = membersJoined.filter(
        (member) =>
          member.contactType === "member" &&
          member.verification === "unverified",
      ).length;

      const verifiedMembers = membersJoined.filter(
        (member) =>
          member.contactType === "member" && member.verification === "verified",
      ).length;

      const ActiveMembers = membersJoined.filter(
        (member) =>
          member.contactType === "member" && member.profile.active === true,
      ).length;

      const noOfMembers = membersJoined.filter(
        (member) => member.contactType === "member",
      ).length;

      let maleCount = 0;
      let femaleCount = 0;
      members.forEach((member) => {
        if (member.gender === "male") {
          maleCount += 1;
        } else if (member.gender === "female") {
          femaleCount += 1;
        }
      });

      const ageGroup = members.reduce(
        (acc, member) => {
          const { age } = member;
          if (age <= 10) {
            acc["0-10"] += 1;
          }
          if (age > 10 && age <= 20) {
            acc["11-20"] += 1;
          }
          if (age > 20 && age <= 30) {
            acc["21-30"] += 1;
          }
          if (age > 30 && age <= 40) {
            acc["31-40"] += 1;
          }
          if (age > 40 && age <= 50) {
            acc["41-50"] += 1;
          }
          if (age > 50 && age <= 60) {
            acc["51-60"] += 1;
          }
          if (age > 60) {
            acc["61-70"] += 1;
          }
          return acc;
        },
        // Initial value of the accumulator
        {
          "0-10": 0,
          "11-20": 0,
          "21-30": 0,
          "31-40": 0,
          "41-50": 0,
          "51-60": 0,
          "61-70": 0,
        },
      );

      logger.info(
        `Members joined ${dateParam} for church with ID: ${churchId}`,
      );
      return {
        length: members.length,
        genderCount: {
          male: maleCount,
          female: femaleCount,
        },
        verifiedCount: verifiedMembers,
        unverifiedCount: unverifiedMembers,
        activeMembers: ActiveMembers,
        noOfContacts: membersJoined.length,
        noOfMembers,
        ageGroup,
        members,
      };
    } catch (error) {
      logger.error(`Error getting members joined stats: ${error.message}`);
      throw error;
    }
  }

  static async getAllMembers(churchId, limit, skip) {
    const members = await Contact.find({
      churchId,
      contactType: "member",
      isDeleted: false,
    })
      .select(
        "profile.firstName profile.lastName profile.email profile.phone profile.gender profile.dateOfBirth profile.photo createdBy",
      )
      .populate("createdBy", "profile.firstName")
      .skip(skip)
      .limit(limit);

    if (!members) {
      throw new AppError("Members not found", 404);
    }
    const membersArray = members.map((member) => ({
      _id: member._id,
      photo: member.profile.photo,
      firstName: member.profile.firstName,
      lastName: member.profile.lastName,
      role: member.orgRole.name ? member.orgRole.name : "Member",
      fullName: `${member.profile.firstName} ${member.profile.lastName}`,
      email: member.profile.email,
      gender: member.profile.gender,
      phone: member.profile.phone.mainPhone,
      dateOfBirth: member.profile.dateOfBirth,
      dateJoined: member.createdAt,
    }));
    return membersArray;
  }

  static async uploadChurchLogo(churchId, req) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const church = await Church.findById(churchId);
      if (!church) {
        throw new AppError("Church not found", 404);
      }

      church.settings.logo = req.file.path;
      await church.save({ session });

      await session.commitTransaction();
      session.endSession();
      return church;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`Error uploading church logo: ${error.message}`);
      throw error;
    }
  }

  static async getRoles(churchId) {
    try {
      const roles = await Role.find({ church: churchId });
      logger.info(`Roles found for church with ID: ${churchId}`);
      return roles;
    } catch (error) {
      logger.error(`Error getting roles: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ChurchService;
