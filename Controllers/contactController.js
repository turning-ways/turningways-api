const catchAsync = require("../utils/catchAsync");
const ContactService = require("../services/contact.service");
const contactValidation = require("../validations/contactValidation");

exports.createContact = [
  contactValidation.createContactValidation,
  catchAsync(async (req, res, next) => {
    const data = req.body;
    const { churchId } = req.params;
    const contact = await ContactService.createContact(data, churchId);
    res.status(201).json({
      status: "success",
      message: "Contact created successfully",
      data: {
        contact: {
          id: contact._id,
          firstName: contact.profile.firstName || null,
          lastName: contact.profile.lastName || null,
          phone: contact.profile.phone.mainPhone || null,
          contactStatus: contact.contactStatus || null,
          memberStatus: contact.memberStatus || null,
          maturityLevel: contact.maturityLevel || null,
          educatonalLevel: contact.profile.educationalLevel || null,
          employmentStatus: contact.profile.employmentStatus || null,
          healthStatus: contact.profile.healthStatus || null,
          assignedTo: contact.assignedTo,
          action: contact.action,
          labels: contact.labels,
          notes: contact.notes,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
        },
      },
    });
  }),
];

exports.getContacts = catchAsync(async (req, res, next) => {
  const { churchId } = req.params;
  const contacts = await ContactService.getContacts(churchId);
  res.status(200).json({
    status: "success",
    message: "Contacts retrieved successfully",
    data: {
      contacts: contacts.map((contact) => ({
        id: contact._id,
        firstName: contact.profile.firstName || null,
        lastName: contact.profile.lastName || null,
        phone: contact.profile.phone.mainPhone || null,
        contactStatus: contact.contactStatus || null,
        memberStatus: contact.memberStatus || null,
        maturityLevel: contact.maturityLevel || null,
        educatonalLevel: contact.profile.educationalLevel || null,
        employmentStatus: contact.profile.employmentStatus || null,
        healthStatus: contact.profile.healthStatus || null,
        assignedTo: contact.assignedTo,
        action: contact.action,
        labels: contact.labels,
        notes: contact.notes,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      })),
    },
  });
});

exports.getContact = catchAsync(async (req, res, next) => {
  const { contactId, churchId } = req.params;
  const contact = await ContactService.getContact(contactId, churchId);
  res.status(200).json({
    status: "success",
    message: "Contact retrieved successfully",
    data: {
      contact: {
        id: contact._id,
        firstName: contact.profile.firstName || null,
        lastName: contact.profile.lastName || null,
        email: contact.profile.email || null,
        dateOfBirth: contact.profile.dateOfBirth || null,
        gender: contact.profile.gender,
        address: contact.profile.address.homeAddress,
        phone: contact.profile.phone.mainPhone || null,
        contactStatus: contact.contactStatus || null,
        memberStatus: contact.memberStatus || null,
        maturityLevel: contact.maturityLevel || null,
        educatonalLevel: contact.profile.educationalLevel || null,
        employmentStatus: contact.profile.employmentStatus || null,
        healthStatus: contact.profile.healthStatus || null,
        assignedTo: contact.assignedTo,
        action: contact.action,
        labels: contact.labels,
        notes: contact.notes,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    },
  });
});

exports.updateContact = [
  contactValidation.updateContactValidation,
  catchAsync(async (req, res, next) => {
    const data = req.body;
    const { contactId, churchId } = req.params;
    const contact = await ContactService.updateContact(
      contactId,
      data,
      churchId,
    );
    res.status(200).json({
      status: "success",
      message: "Contact updated successfully",
      data: {
        contact: {
          id: contact._id,
          firstName: contact.profile.firstName || null,
          lastName: contact.profile.lastName || null,
          phone: contact.profile.phone.mainPhone || null,
          contactStatus: contact.contactStatus || null,
          memberStatus: contact.memberStatus || null,
          maturityLevel: contact.maturityLevel || null,
          educatonalLevel: contact.profile.educationalLevel || null,
          employmentStatus: contact.profile.employmentStatus || null,
          healthStatus: contact.profile.healthStatus || null,
          assignedTo: contact.assignedTo,
          action: contact.action,
          labels: contact.labels,
          notes: contact.notes,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
        },
      },
    });
  }),
];

exports.deleteContact = catchAsync(async (req, res, next) => {
  const { contactId, churchId } = req.params;
  await ContactService.deleteContact(contactId, churchId);
  res.status(204).json({
    status: "success",
    message: "Contact deleted successfully",
    data: null,
  });
});

exports.getNotes = catchAsync(async (req, res, next) => {
  const { contactId, churchId } = req.params;
  const notes = await ContactService.getContactNotes(contactId, churchId);
  res.status(200).json({
    status: "success",
    message: "Notes retrieved successfully",
    data: notes,
  });
});

exports.createNote = [
  contactValidation.createNoteValidation,
  catchAsync(async (req, res, next) => {
    const data = req.body;
    const { contactId, churchId } = req.params;
    const note = await ContactService.addContactNote(contactId, data, churchId);
    res.status(201).json({
      status: "success",
      message: "Note created successfully",
      data: {
        note,
      },
    });
  }),
];

exports.updateNote = [
  contactValidation.updateNoteValidation,
  catchAsync(async (req, res, next) => {
    const data = req.body;
    const { contactId, noteId, churchId } = req.params;
    const note = await ContactService.updateContactNote(
      contactId,
      noteId,
      data,
      churchId,
    );
    res.status(200).json({
      status: "success",
      message: "Note updated successfully",
      data: {
        note,
      },
    });
  }),
];

exports.deleteNote = catchAsync(async (req, res, next) => {
  const { contactId, noteId, churchId } = req.params;
  await ContactService.deleteContactNote(contactId, noteId, churchId);
  res.status(204).json({
    status: "success",
    message: "Note deleted successfully",
    data: null,
  });
});

// AsignMent
exports.assignContact = catchAsync(async (req, res, next) => {
  const { contactId, churchId, memberId } = req.params;
  const contact = await ContactService.assignContact(
    contactId,
    memberId,
    churchId,
  );
  res.status(200).json({
    status: "success",
    message: "Contact assigned successfully",
    data: {
      assignedTo: contact.assignedTo,
    },
  });
});

exports.unassignContact = catchAsync(async (req, res, next) => {
  const { contactId, churchId } = req.params;
  const contact = await ContactService.unassignContact(contactId, churchId);
  res.status(200).json({
    status: "success",
    message: "Contact unassigned successfully",
    data: {
      assignedTo: contact.assignedTo,
    },
  });
});

// Label
exports.addLabel = catchAsync(async (req, res, next) => {
  const { contactId, churchId } = req.params;
  const data = req.body;
  const contact = await ContactService.addLabel(contactId, data, churchId);
  res.status(200).json({
    status: "success",
    message: "Label added successfully",
    data: {
      labels: contact.labels,
    },
  });
});

exports.getLabels = catchAsync(async (req, res, next) => {
  const { contactId, churchId } = req.params;
  const labels = await ContactService.getLabels(contactId, churchId);
  res.status(200).json({
    status: "success",
    message: "Labels retrieved successfully",
    data: labels,
  });
});

exports.removeLabel = catchAsync(async (req, res, next) => {
  const { contactId, churchId, labelId } = req.params;
  const contact = await ContactService.removeLabel(
    contactId,
    labelId,
    churchId,
  );
  res.status(200).json({
    status: "success",
    message: "Label removed successfully",
    data: {
      labels: contact.labels,
    },
  });
});

exports.addAction = catchAsync(async (req, res, next) => {
  const { contactId, churchId } = req.params;
  const data = req.body;
  const contact = await ContactService.addActionItem(contactId, data, churchId);
  res.status(200).json({
    status: "success",
    message: "Action added successfully",
    data: {
      action: contact.action,
    },
  });
});

exports.updateAction = catchAsync(async (req, res, next) => {
  const { contactId, actionId, churchId } = req.params;
  const contact = await ContactService.updateActionItem(
    contactId,
    actionId,
    churchId,
  );
  res.status(200).json({
    status: "success",
    message: "Action updated successfully",
    data: {
      action: contact.action,
    },
  });
});

exports.changeStatus = catchAsync(async (req, res, next) => {
  const { contactId, churchId } = req.params;
  const contact = await ContactService.changeContactStatus(
    contactId,
    req.body,
    churchId,
  );
  res.status(200).json({
    status: "success",
    message: "Contact status changed successfully",
    data: {
      contactStatus: contact.contactStatus,
    },
  });
});
