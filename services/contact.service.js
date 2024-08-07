const moment = require("moment");
const mongoose = require("mongoose");
const Contact = require("../model/contactModel");
const Church = require("../model/churchModel");
// const Role = require("../models/roleModel");
// const User = require("../model/userModel");
const AppError = require("../utils/appError");

class ContactService {
  static async createContact(data, churchId) {
    const church = await Church.findOne({
      _id: churchId,
    });
    if (!church) {
      throw new AppError("Church not found", 404);
    }

    // Check if the contact already exists
    if (data.email !== undefined && data.email !== null && data.email !== "") {
      const contactExists = await Contact.findOne({
        "profile.email": data.email,
        churchId,
      });
      if (contactExists) {
        throw new AppError("Email already exists", 400);
      }
    }

    // for phone number
    const phoneExists = await Contact.findOne({
      "profile.phone.mainPhone": data.phone,
      churchId,
    });
    if (phoneExists) {
      throw new AppError("Phone number already exists", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const contact = await Contact.create(
        [
          {
            churchId,
            profile: {
              firstName: data.firstName,
              lastName: data.lastName,
              gender: data.gender,
              address: {
                homeAddress: data.address,
              },
              email: data.email,
              phone: { mainPhone: data.phone },
            },
            verification: "unverified",
            contactStatus: "new",
            maturityLevel: data.maturityLevel,
            notes: [
              {
                comment: "Contact created",
                type: "contact",
                date: moment().format(),
                member: data.createdBy,
              },
            ],
            createdBy: data.createdBy,
          },
        ],
        { session },
      );
      await session.commitTransaction();
      return contact[0];
    } catch (error) {
      await session.abortTransaction();
      if (error.code === 11000) {
        throw new AppError("Contact already exists", 400);
      }
      if (error.name === "ValidationError") {
        throw new AppError("phone number already exists", 400);
      }
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  static async getContact(contactId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    }).populate(
      "assignedTo notes.member createdBy",
      "profile.firstName profile.lastName profile.photo",
    );
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    return contact;
  }

  static async getContacts(churchId) {
    const contacts = await Contact.find({
      churchId,
      isDeleted: false,
    })
      .select("-notes -action")
      .populate(
        "assignedTo",
        "profile.firstName profile.lastName profile.photo",
      );
    return contacts;
  }

  static async updateContact(contactId, data, churchId) {
    const contact = await Contact.find({
      _id: contactId,
      churchId,
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updateFields = {};
      if (data.firstName) updateFields["profile.firstName"] = data.firstName;
      if (data.lastName) updateFields["profile.lastName"] = data.lastName;
      if (data.gender) updateFields["profile.gender"] = data.gender;
      if (data.dateOfBirth)
        updateFields["profile.dateOfBirth"] = data.dateOfBirth;
      if (data.address)
        updateFields["profile.address.homeAddress"] = data.address;
      if (data.email) updateFields["profile.email"] = data.email;
      if (data.phone) updateFields["profile.phone.mainPhone"] = data.phone;
      if (data.maturityLevel) updateFields.maturityLevel = data.maturityLevel;
      if (data.contactType) updateFields.contactType = data.contactType;
      updateFields.notes = [
        {
          comment: "Contact updated",
          type: "contact",
          // generate a new timestamp
          date: moment().format(),
          member: data.modifiedBy,
        },
      ];

      // check if email or phone number already exists
      const contactExists = await Contact.findOne({
        $or: [
          { "profile.email": data.email },
          { "profile.phone.mainPhone": data.phone },
        ],
        churchId,
        _id: { $ne: contactId },
      });
      if (contactExists) {
        throw new AppError(
          "Contact with email or phone number already exists",
          400,
        );
      }

      let updatedContact = await Contact.findOneAndUpdate(
        { _id: contactId, churchId },
        updateFields,
        { new: true, session },
      );

      updatedContact = await updatedContact.populate(
        "notes.member",
        "profile.firstName profile.lastName",
      );

      updatedContact = await updatedContact.populate(
        "assignedTo",
        "profile.firstName profile.lastName",
      );

      await session.commitTransaction();
      return updatedContact;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  // Assign contact to user
  static async assignContact(contactId, assignedId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // check if the assigned Id  has already been assigned to the contact
      const assigned = contact.assignedTo.find(
        (id) => id.toString() === assignedId.toString(),
      );
      if (assigned) {
        throw new AppError("User already assigned to contact", 400);
      }

      const updatedContact = await Contact.findOneAndUpdate(
        { _id: contactId, churchId },
        {
          $push: {
            assignedTo: assignedId,
          },
        },
        { new: true, session },
      ).populate(
        "assignedTo",
        "profile.firstName profile.lastName profile.photo",
      );
      await session.commitTransaction();
      return updatedContact;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  // Unassign contact from user
  static async unassignContact(contactId, assignedId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const assigned = contact.assignedTo.find(
        (id) => id.toString() === assignedId.toString(),
      );
      if (!assigned) {
        throw new AppError("User not assigned to contact", 400);
      }

      const updatedContact = await Contact.findOneAndUpdate(
        { _id: contactId, churchId },
        {
          $pull: {
            assignedTo: assignedId,
          },
        },
        { new: true, session },
      ).populate(
        "assignedTo",
        "profile.firstName profile.lastName profile.photo",
      );
      await session.commitTransaction();
      return updatedContact;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  // Actions
  static async addActionItem(contactId, data, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const action = {
        name: data.name,
        completed: false,
      };

      const updatedContact = await Contact.findOneAndUpdate(
        { _id: contactId, churchId },
        {
          $push: {
            action: action,
          },
        },
        { new: true, session },
      );
      await session.commitTransaction();
      return updatedContact;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  static async updateActionItem(contactId, actionId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const action = contact.action.id(actionId);
      if (!action) {
        throw new AppError("Action item not found", 404);
      }
      action.completed = !action.completed;
      const updatedContact = await contact.save({ session });
      await session.commitTransaction();
      return updatedContact;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  static async deleteActionItem(contactId, actionId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const action = contact.action.id(actionId);
    if (!action) {
      throw new AppError("Action item not found", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      contact.action = contact.action.filter(
        (act) => act._id.toString() !== actionId,
      );
      await contact.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  // Labels
  static async addLabel(contactId, data, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const label = {
        label: data.label,
        color: data.color,
      };

      const updatedContact = await Contact.findOneAndUpdate(
        { _id: contactId, churchId },
        {
          $push: {
            labels: label,
          },
        },
        { new: true, session },
      );
      await session.commitTransaction();
      return updatedContact;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  static async getLabels(contactId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    return contact.labels;
  }

  static async removeLabel(contactId, labelId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const label = contact.labels.id(labelId);
      if (!label) {
        throw new AppError("Label not found", 404);
      }
      contact.labels = contact.labels.filter(
        (lab) => lab._id.toString() !== labelId,
      );
      await contact.save({ session });
      await session.commitTransaction();
      return contact.labels;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  // Notes
  static async getContactNotes(contactId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    }).populate("notes.member", "profile.firstName profile.lastName");
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    return {
      notes: contact.notes,
      updatedAt: contact.updatedAt,
    };
  }

  static async addContactNote(contactId, data, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const note = {
        comment: data.note,
        type: "contact",
        member: data.createdBy,
      };

      const updatedContact = await Contact.findOneAndUpdate(
        { _id: contactId, churchId },
        {
          $push: {
            notes: note,
          },
        },
        { new: true, session },
      ).populate("notes.member", "profile.firstName profile.lastName");
      await session.commitTransaction();
      return {
        notes: updatedContact.notes,
        updatedAt: updatedContact.updatedAt,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  static async updateContactNote(contactId, noteId, data, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    }).populate("notes.member", "profile.firstName profile.lastName");
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const note = contact.notes.id(noteId);
      if (!note) {
        throw new AppError("Note not found", 404);
      }
      note.comment = data.note;
      note.member = data.modifiedBy;
      note.isEdited = true;
      note.date = Date.now();
      const updatedContact = await contact.save({ session });
      await session.commitTransaction();
      return {
        note: updatedContact.notes.id(noteId),
        updatedAt: updatedContact.updatedAt,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  static async deleteContactNote(contactId, noteId, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const note = contact.notes.id(noteId);
    if (!note) {
      throw new AppError("Note not found", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      contact.notes = contact.notes.filter(
        (notee) => notee._id.toString() !== noteId,
      );
      await contact.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  static async changeContactStatus(contactId, data, churchId) {
    const contact = await Contact.findOne({
      _id: contactId,
      churchId,
    });
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      contact.contactStatus = data.status;
      contact.notes.push({
        comment: `Contact status changed to ${data.status}`,
        type: "contact",
        date: Date.now(),
        member: data.modifiedBy,
      });
      const updatedContact = await contact.save({ session });
      await session.commitTransaction();
      return updatedContact;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }

  static async deleteContact(contactId, churchId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const contact = await Contact.deleteOne({
        _id: contactId,
        churchId,
      });
      await session.commitTransaction();
      return contact;
    } catch (error) {
      await session.abortTransaction();
      throw new AppError(error, 500);
    } finally {
      session.endSession();
    }
  }
}

module.exports = ContactService;
