const mongoose = require("mongoose");
const hash = require("object-hash");
const User = require("../model/userModel");
const Role = require("../model/roleModel");
const Member = require("../model/contactModel");
const AppError = require("../utils/appError");
const { logger } = require("../utils/logger");
const helper = require("../utils/helpers");

const { clearCache } = require("../middlewares/redis");

class MemberService {
  static async createMemberOnboarding(
    data,
    churchId,
    userId,
    userDetails,
    createdRoles,
    session,
  ) {
    // Validate input data
    if (
      !data.gender ||
      !data.dateOfBirth ||
      !data.phone ||
      !data.howDidYouHear
    ) {
      throw new AppError("Missing required fields", 400);
    }

    console.log(churchId);
    // Check if the userId exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new AppError("User Id does not exist", 404);
    }
    if (userExists.mainChurch) {
      if (userExists.mainChurch.toString() !== churchId) {
        throw new AppError("There was an Error creating this Member", 400);
      }
    }

    // Check if the user has a role == admin
    if (userExists.role !== "admin") {
      throw new AppError(
        "You do not have the permission to create a member",
        403,
      );
    }

    // Check the role super-admin exists for that churchId and use the session
    const roleExists = createdRoles.find((role) => role.name === "Super-Admin");
    if (!roleExists) {
      throw new AppError("Role does not exist", 404);
    }

    // Check for duplicate member
    const duplicateMember = await Member.findOne({
      "profile.email": userDetails.email,
      churchId: churchId,
      contactType: "member",
    });
    if (duplicateMember) {
      throw new AppError("Member with this email already exists", 409);
    }

    const member = new Member({
      userId,
      orgRole: roleExists._id,
      churchId: churchId,
      profile: {
        firstName: userExists.firstName,
        middleName: data.middleName,
        lastName: userDetails.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        phone: {
          mainPhone: data.phone,
        },
        photo: userExists.photo,
        email: data.email,
      },
      howDidYouHear: data.howDidYouHear,
      verification: "verified",
      contactType: "member",
    });
    const newMember = await member.save({ session });
    if (!newMember) {
      throw new AppError("Member not created", 400);
    }

    logger.info(`Member created with ID: ${newMember._id}`);
    return newMember;
  }

  static async createMember(data) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Check for duplicate member
      if (
        data.email !== undefined &&
        data.email !== null &&
        data.email !== ""
      ) {
        const duplicateMember = await Member.findOne({
          "profile.email": data.email,
          churchId: data.churchId,
          contactType: "member",
        });
        if (duplicateMember) {
          throw new AppError("Member with this email already exists", 409);
        }
      }

      const phoneExists = await Member.findOne({
        "profile.phone.mainPhone": data.phone,
        churchId: data.churchId,
      });
      if (phoneExists) {
        throw new AppError("Phone number already exists", 400);
      }

      // get the member role
      const role = await Role.findOne({
        name: helper.capitalize(data.role),
      });
      if (!role) {
        throw new AppError("Role does not exist", 404);
      }

      const member = await Member.create(
        [
          {
            churchId: data.churchId,
            orgRole: role._id,
            profile: {
              firstName: data.firstName,
              middleName: data.middleName,
              lastName: data.lastName,
              suffix: data.suffix,
              prefix: data.prefix,
              gender: data.gender,
              dateOfBirth: data.dateOfBirth,
              maritalStatus: data.maritalStatus,
              address: {
                homeAddress: data.homeAddress,
                workAddress: data.workAddress,
              },
              phone: {
                mainPhone: data.phone,
                otherPhone: [data.mobilePhone],
                workPhone: data.workPhone,
              },
              email: data.email,
              workerStatus: data.workerStatus,
              worker: data.worker,
              active: data.active,
              educationalLevel: data.educationalLevel,
              employmentStatus: data.employmentStatus,
              healthStatus: data.healthStatus,
              healthConditionRemarks: data.healthConditionRemarks,
            },
            createdBy: data.createdBy,
            modifiedBy: data.createdBy,
            contactType: "member",
          },
        ],
        { session },
      );

      if (!member || member.length === 0) {
        throw new AppError("Member not created", 400);
      }

      // form the requestKey for the cache
      const requestUrl = `/api/v1/churches/${data.churchId}/members`;
      const requestKey = hash(requestUrl);
      await clearCache(requestKey);

      await session.commitTransaction();
      logger.info(`Member created with ID: ${member[0]._id}`);
      return member[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error creating member: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getMemberRole(userId) {
    try {
      const member = await Member.findOne({
        userId,
        contactType: "member",
      }).populate("orgRole", "name");
      if (!member) {
        return null;
      }
      logger.info(`Member found with User IDs: ${userId}`);
      return member.orgRole;
    } catch (error) {
      logger.error(`Error finding member by User ID: ${error.message}`);
      throw new AppError(error.message, 400);
    }
  }

  static async findMemberById(id) {
    try {
      const member = await Member.findOne({
        _id: id,
        contactType: "member",
      })
        .select("-__v -isDeleted -assignedTo -action -labels -howDidYouHear")
        .populate("orgRole", "name")
        .populate("createdBy", "profile.firstName profile.lastName");
      if (!member || member.isDeleted) {
        throw new AppError("Member not found", 404);
      }
      logger.info(`Member found with ID: ${id}`);
      return member;
    } catch (error) {
      logger.error(`Error finding member by ID: ${error.message}`);
      throw error;
    }
  }

  static async findMemberByUserId(userId) {
    try {
      const member = await Member.findOne({
        userId,
        contactType: "member",
        isDeleted: false,
      }).select("-__v -isDeleted ");
      if (!member || member.isDeleted) {
        throw new AppError("Member not found", 404);
      }
      logger.info(`Member found with User ID: ${userId}`);
      return member;
    } catch (error) {
      logger.error(`Error finding member by User ID: ${error.message}`);
      throw error;
    }
  }

  static async findMembersByChurchId(churchId, page = 1, limit = 10) {
    try {
      const members = await Member.find({
        churchId,
        contactType: "member",
      })
        .skip((page - 1) * limit)
        .limit(limit);
      if (!members.length) {
        throw new AppError("Members not found", 404);
      }
      logger.info(`Members found for Church ID: ${churchId}`);
      return members;
    } catch (error) {
      logger.error(`Error finding members by Church ID: ${error.message}`);
      throw error;
    }
  }

  static async findMembersByOrgRole(orgRole, page = 1, limit = 10) {
    try {
      const members = await Member.find({
        orgRole,
        contactType: "member",
      })
        .skip((page - 1) * limit)
        .limit(limit);
      if (!members.length) {
        throw new AppError("Members not found", 404);
      }
      logger.info(`Members found for Org Role: ${orgRole}`);
      return members;
    } catch (error) {
      logger.error(`Error finding members by Org Role: ${error.message}`);
      throw error;
    }
  }

  static async updateMember(id, data) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updateFields = {};

      // Profile fields
      if (data.firstName) updateFields["profile.firstName"] = data.firstName;
      if (data.middleName) updateFields["profile.middleName"] = data.middleName;
      if (data.lastName) updateFields["profile.lastName"] = data.lastName;
      if (data.suffix) updateFields["profile.suffix"] = data.suffix;
      if (data.prefix) updateFields["profile.prefix"] = data.prefix;
      if (data.gender) updateFields["profile.gender"] = data.gender;
      if (data.dateOfBirth)
        updateFields["profile.dateOfBirth"] = data.dateOfBirth;
      if (data.maritalStatus)
        updateFields["profile.maritalStatus"] = data.maritalStatus;

      // Address fields
      if (data.homeAddress)
        updateFields["profile.address.homeAddress"] = data.homeAddress;
      if (data.workAddress)
        updateFields["profile.address.workAddress"] = data.workAddress;

      // Phone fields
      if (data.mainPhone)
        updateFields["profile.phone.mainPhone"] = data.mainPhone;
      if (data.mobilePhone)
        updateFields["profile.phone.otherPhone"] = [data.mobilePhone];
      if (data.workPhone)
        updateFields["profile.phone.workPhone"] = data.workPhone;

      // Other fields
      if (data.email) updateFields["profile.email"] = data.email;
      if (data.workerStatus)
        updateFields["profile.workerStatus"] = data.workerStatus;
      if (data.worker) updateFields["profile.worker"] = data.worker;
      if (data.active) updateFields["profile.active"] = data.active;
      if (data.educationalLevel)
        updateFields["profile.educationalLevel"] = data.educationalLevel;
      if (data.employmentStatus)
        updateFields["profile.employmentStatus"] = data.employmentStatus;
      if (data.healthStatus)
        updateFields["profile.healthStatus"] = data.healthStatus;
      if (data.healthConditionRemarks)
        updateFields["profile.healthConditionRemarks"] =
          data.healthConditionRemarks;
      if (data.modifiedBy) updateFields["profile.modifiedBy"] = data.modifiedBy;

      const member = await Member.findOneAndUpdate(
        {
          _id: id,
          contactType: "member",
        },
        {
          $set: updateFields,
        },
        {
          new: true,
          session,
        },
      );

      if (!member) {
        throw new AppError("Member not updated", 400);
      }

      // form the requestKey for the cache
      const requestUrl = `/api/v1/churches/${member.churchId}/members`;
      const requestKey = hash(requestUrl);
      await clearCache(requestKey);

      await session.commitTransaction();
      logger.info(`Member updated with ID: ${id}`);
      return member;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error updating member: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async deleteMember(id) {
    try {
      const member = await Member.findOneAndUpdate(
        {
          _id: id,
          contactType: "member",
        },
        { isDeleted: true },
        {
          new: true,
        },
      );
      if (!member) {
        throw new AppError("Member not deleted", 400);
      }

      // form the requestKey for the cache
      const requestUrl = `/api/v1/churches/${member.churchId}/members`;
      const requestKey = hash(requestUrl);
      await clearCache(requestKey);

      logger.info(`Member soft deleted with ID: ${id}`);
      return member;
    } catch (error) {
      logger.error(`Error deleting member: ${error.message}`);
      throw error;
    }
  }

  static async restoreMember(id) {
    try {
      const member = await Member.findOneAndUpdate(
        {
          _id: id,
          contactType: "member",
        },
        { isDeleted: false },
        {
          new: true,
        },
      );
      if (!member) {
        throw new AppError("Member not restored", 400);
      }
      logger.info(`Member restored with ID: ${id}`);
      return member;
    } catch (error) {
      logger.error(`Error restoring member: ${error.message}`);
      throw error;
    }
  }

  static async batchDeleteMembersPermanent(ids) {
    try {
      const members = await Member.deleteMany({
        _id: { $in: ids },
        contactType: "member",
      });
      if (!members) {
        throw new AppError("Members not deleted", 400);
      }
      logger.info(`Members permanently deleted with IDs: ${ids}`);
      return members;
    } catch (error) {
      logger.error(`Error deleting members: ${error.message}`);
      throw error;
    }
  }

  static async uploadProfilePicture(id, req) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const member = await Member.findOne({
        _id: id,
        contactType: "member",
      });
      if (!member) {
        throw new AppError("Member not updated", 400);
      }

      member.profile.photo = req.file.path;
      await member.save({ session, validateBeforeSave: false });
      await session.commitTransaction();
      logger.info(`Member updated with ID: ${id}`);
      return member;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error updating member: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async updateVerificationStatus(id, data) {
    try {
      const member = await Member.findOne({
        _id: id,
        contactType: "member",
        isDeleted: false,
      });
      if (!member) {
        throw new AppError("Member not updated", 400);
      }

      member.verification = data.verification;
      await member.save();
      logger.info(`Member updated with ID: ${id}`);
      return member;
    } catch (error) {
      logger.error(`Error updating member: ${error.message}`);
      throw error;
    }
  }

  static async addNoteToMember(id, data) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const member = await Member.findOne({
        _id: id,
        contactType: "member",
      }).populate("notes.member", "profile.firstName profile.lastName");
      if (!member) {
        throw new AppError("Member not updated", 400);
      }

      await member.addNote({
        comment: data.note,
        date: Date.now(),
        type: "general",
        member: data.createdBy,
      });

      member.populate("notes.member", "profile.firstName profile.lastName _id");

      const notes = member.notes.map((note) => ({
        id: note._id,
        comment: note.comment,
        date: note.date,
        type: note.type,
        createdBy: note.member,
      }));

      await session.commitTransaction();
      logger.info(`Member updated with ID: ${id}`);
      return notes;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error updating member: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getMemberNotes(id) {
    try {
      const member = await Member.findOne({
        _id: id,
        contactType: "member",
      }).populate("notes.member", "profile.firstName profile.lastName");

      if (!member) {
        throw new AppError("Member not found", 404);
      }

      const notes = member.notes
        .map((note) => {
          if (!note.member) {
            return null; // or handle this case as needed
          }
          return {
            id: note._id,
            comment: note.comment,
            date: note.date,
            type: note.type,
            isEdited: note.isEdited,
            createdBy: {
              id: note.member._id,
              name: `${note.member.profile.firstName} ${note.member.profile.lastName}`,
              role: note.member.orgRole.name,
            },
          };
        })
        .filter((note) => note !== null); // Remove any null notes from the array

      logger.info(`Member found with ID: ${id}`);
      return notes;
    } catch (error) {
      logger.error(`Error finding member by ID: ${error.message}`);
      throw error;
    }
  }

  static async updateNoteById(id, noteId, data) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const member = await Member.findOne({
        _id: id,
        contactType: "member",
        notes: { $elemMatch: { _id: noteId } },
      }).populate("notes.member", "profile.firstName profile.lastName");

      if (!member) {
        throw new AppError("Member not updated", 400);
      }

      member.updateNote(noteId, data);
      const updateMember = await Member.findOne({ _id: id }, "notes").populate(
        "notes.member",
        "profile.firstName profile.lastName",
      );

      const notes = updateMember.notes.map((note) => ({
        id: note._id,
        comment: note.comment,
        date: note.date,
        type: note.type,
        isEdited: note.isEdited,
      }));

      await session.commitTransaction();
      logger.info(`Member updated with ID: ${id}`);
      return notes;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error updating member: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async deleteMemberNoteById(id, noteId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const member = await Member.findOne({
        _id: id,
        contactType: "member",
        notes: { $elemMatch: { _id: noteId } },
      });

      if (!member) {
        throw new AppError("Member not updated", 400);
      }

      await Member.updateOne(
        { _id: id },
        { $pull: { notes: { _id: noteId } } },
        { session, new: true },
      );

      await session.commitTransaction();
      logger.info(`Member updated with ID: ${id}`);
      return member;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error updating member: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getMe(userId) {
    try {
      const member = await Member.findOne({
        userId,
        contactType: "member",
      }).populate("orgRole churchId", "name");

      if (!member) {
        throw new AppError("Member not found", 404);
      }
      logger.info(`Member found with User ID: ${userId}`);
      return member;
    } catch (error) {
      logger.error(`Error finding member by User ID: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MemberService;
