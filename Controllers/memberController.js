const catchAsync = require("../utils/catchAsync");
const MemberService = require("../services/member.service");
const memberValidation = require("../validations/memberValidation");

exports.createMemberOnboarding = [
  memberValidation.memberOnboardingValidation,
  catchAsync(async (req, res, next) => {
    const data = req.body;
    const userId = req.user.id;
    const userDetails = req.user;
    const member = await MemberService.createMemberOnboarding(
      data,
      userId,
      userDetails,
    );
    res.status(201).json({
      status: "success",
      message: "Member created successfully",
      data: {
        memberId: member._id,
        firstName: member.profile.firstName,
        lastName: member.profile.lastName,
        role: member.orgRole.name,
      },
    });
  }),
];

exports.addMember = [
  memberValidation.addMemberValidation,
  catchAsync(async (req, res, next) => {
    const data = req.body;
    const member = await MemberService.createMember(data);
    res.status(201).json({
      status: "success",
      message: "Member added successfully",
      data: {
        memberId: member._id,
        firstName: member.profile.firstName,
        lastName: member.profile.lastName,
        role: member.orgRole.name,
      },
    });
  }),
];

exports.uploadProfilePicture = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;
  const member = await MemberService.uploadProfilePicture(memberId, req);
  res.status(200).json({
    status: "success",
    message: "Profile picture uploaded successfully",
    data: {
      memberId: member._id,
      profilePicture: member.profile.photo,
    },
  });
});

exports.getMember = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;
  const member = await MemberService.findMemberById(memberId);
  res.status(200).json({
    status: "success",
    message: "Member found",
    data: {
      member,
    },
  });
});

exports.updateMember = [
  memberValidation.updateMemberValidation,
  catchAsync(async (req, res, next) => {
    const memberId = req.params.id;
    const data = req.body;
    const member = await MemberService.updateMember(memberId, data);
    res.status(200).json({
      status: "success",
      message: "Member updated successfully",
      data: member,
    });
  }),
];

exports.deleteMember = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;
  await MemberService.deleteMember(memberId);
  res.status(204).json({
    status: "success",
    message: "Member deleted successfully",
    data: null,
  });
});

exports.batchDeleteMembers = catchAsync(async (req, res, next) => {
  const data = req.body;
  await MemberService.batchDeleteMembersPermanent(data.ids);
  res.status(204).json({
    status: "success",
    message: "Members deleted successfully",
    data: null,
  });
});

exports.updateVerificationStatus = catchAsync(async (req, res, next) => {
  const { memberId } = req.params;
  const data = req.body;
  const member = await MemberService.updateVerificationStatus(memberId, data);
  res.status(200).json({
    status: "success",
    message: "Verification status updated successfully",
    data: member,
  });
});

exports.addNoteToMember = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;
  const data = req.body;
  const notes = await MemberService.addNoteToMember(memberId, data);
  res.status(200).json({
    status: "success",
    message: "Note added to member successfully",
    data: {
      memberId: memberId,
      notes: notes,
    },
  });
});

exports.getMemberNotes = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;
  const notes = await MemberService.getMemberNotes(memberId);
  res.status(200).json({
    status: "success",
    message: "Member notes retrieved successfully",
    data: {
      memberId,
      notes,
    },
  });
});

exports.updateNote = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;
  const { noteId } = req.params;
  const data = req.body;
  const notes = await MemberService.updateNoteById(memberId, noteId, data);
  res.status(200).json({
    status: "success",
    message: "Member note updated successfully",
    data: {
      memberId: memberId,
      notes: notes,
    },
  });
});

exports.deleteMemberNoteById = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;
  const { noteId } = req.params;
  await MemberService.deleteMemberNoteById(memberId, noteId);
  res.status(200).json({
    status: "success",
    message: "Member note deleted successfully",
    // data: {
    //   memberId: member._id,
    //   notes: member.notes,
    // },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const member = await MemberService.getMe(userId);
  res.status(200).json({
    status: "success",
    message: "Member found",
    data: {
      member: {
        memberId: member._id,
        firstName: member.profile.firstName,
        lastName: member.profile.lastName,
        photo: member.profile.photo,
        role: member.orgRole.name,
        church: member.churchId.name,
        churchId: member.churchId._id,
      },
    },
  });
});
