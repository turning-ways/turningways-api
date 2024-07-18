const mongoose = require("mongoose");
const moment = require("moment");
const Level = require("../model/levelModel");
const User = require("../model/userModel");
const Contact = require("../model/contactModel");
const Church = require("../model/churchModel");
const Role = require("../model/roleModel");
const { logger } = require("../utils/logger");
const AppError = require("../utils/appError");

const permissions = {
  church: ["CREATE_CHURCH", "UPDATE_CHURCH", "DELETE_CHURCH"],
  request: ["SEND_REQUEST"],
  churchRequest: ["ACCEPT_REQUEST", "REJECT_REQUEST", "DELETE_REQUEST"],
  level: ["CREATE_LEVEL", "UPDATE_LEVEL", "DELETE_LEVEL"],
  churchLevel: ["ADD_LEVEL", "REMOVE_LEVEL"],
  role: ["CREATE_ROLE", "UPDATE_ROLE", "DELETE_ROLE"],
  member: ["CREATE_MEMBER", "UPDATE_MEMBER", "DELETE_MEMBER"],
  event: ["CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT"],
  group: ["CREATE_GROUP", "UPDATE_GROUP", "DELETE_GROUP"],
  groupMember: ["ADD_MEMBER", "REMOVE_MEMBER"],
  groupEvent: ["ADD_EVENT", "REMOVE_EVENT"],
  me: ["UPDATE_ME", "DELETE_ME"],
};

const createDefaultRoles = async (churchId, isHQ, session) => {
  const roles = [
    {
      name: "Admin",
      church: churchId,
      description: "Admin role",
      permissions: [
        ...permissions.church,
        ...permissions.level,
        ...permissions.request,
        ...permissions.churchLevel,
        ...permissions.role,
        ...permissions.member,
        ...permissions.event,
        ...permissions.group,
        ...permissions.groupMember,
        ...permissions.groupEvent,
      ],
    },
    {
      name: "Member",
      church: churchId,
      description: "Member role",
      permissions: [...permissions.me],
    },
  ];

  if (isHQ) {
    roles.unshift({
      name: "Super-Admin",
      church: churchId,
      description: "Super admin role",
      permissions: [
        ...permissions.church,
        ...permissions.churchRequest,
        ...permissions.request,
        ...permissions.level,
        ...permissions.churchLevel,
        ...permissions.role,
        ...permissions.member,
        ...permissions.event,
        ...permissions.group,
        ...permissions.groupMember,
        ...permissions.groupEvent,
        ...permissions.me,
      ],
    });
  }

  await Role.create(roles, { session });
};

const createChurch = async (churchData, session) => {
  const church = await Church.create([churchData], { session });
  return church[0];
};

const createChurchOnBoardingService = async (churchData, req) => {
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

    await createDefaultRoles(church._id, !churchData.hasParentChurch, session);

    await User.findByIdAndUpdate(
      userId,
      { $set: { mainChurch: church._id, churches: [church._id] } },
      { session },
    );

    logger.info(`Church created with ID: ${church._id}`);
    await session.commitTransaction();
    session.endSession();
    return church;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Error creating church: ${error}`);
    throw error;
  }
};

class ChurchService {
  static async createChurchOnBoarding(churchData, req) {
    return createChurchOnBoardingService(churchData, req);
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

  static async getMemberCount(churchId) {
    try {
      const members = await Contact.find({ churchId, contactType: "member" });
      logger.info(`Members count for church with ID: ${churchId}`);
      return members.length;
    } catch (error) {
      logger.error(`Error getting member count: ${error.message}`);
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
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        contactType: "member",
      }).select(
        "profile.firstName profile.lastName _id profile.email profile.phone.mainPhone profile.dateOfBirth profile.gender profile.maritalStatus",
      );

      // Process and return results (remaining code unchanged)
      const members = membersJoined.map((member) => ({
        id: member._id,
        firstName: member.profile.firstName,
        lastName: member.profile.lastName,
        email: member.profile.email,
        phone: member.profile.phone.mainPhone,
        dateOfBirth: member.profile.dateOfBirth,
        age: member.age,
      }));
      let maleCount = 0;
      let femaleCount = 0;
      membersJoined.forEach((member) => {
        if (member.profile.gender === "male") {
          maleCount += 1;
        } else if (member.profile.gender === "female") {
          femaleCount += 1;
        }
      });

      const ageGroup = membersJoined.reduce(
        (acc, member) => {
          const { age } = member;
          if (age <= 18) {
            acc["0-18"] += 1;
          } else if (age <= 30) {
            acc["19-30"] += 1;
          } else if (age <= 40) {
            acc["31-40"] += 1;
          } else if (age <= 50) {
            acc["41-50"] += 1;
          } else if (age <= 60) {
            acc["51-60"] += 1;
          } else if (age <= 70) {
            acc["61-70"] += 1;
          } else {
            acc["71+"] += 1;
          }
          return acc;
        },
        {
          "0-18": 0,
          "19-30": 0,
          "31-40": 0,
          "41-50": 0,
          "51-60": 0,
          "61-70": 0,
          "71+": 0,
        },
      );

      logger.info(
        `Members joined ${dateParam} for church with ID: ${churchId}`,
      );
      return {
        length: membersJoined.length,
        genderCount: {
          male: maleCount,
          female: femaleCount,
        },
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
      isDeleted: false,
      contactType: "member",
    })
      .select(
        "profile.firstName profile.lastName profile.email profile.phone profile.gender profile.dateOfBirth",
      )
      .skip(skip)
      .limit(limit);

    if (!members) {
      throw new AppError("Members not found", 404);
    }
    const membersArray = members.map((member) => ({
      fullName: `${member.profile.firstName} ${member.profile.lastName}`,
      email: member.profile.email,
      phone: member.profile.phone.mainPhone,
      dateOfBirth: member.profile.dateOfBirth,
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
}

module.exports = ChurchService;
