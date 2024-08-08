const express = require("express");
const multer = require("multer");
const memberController = require("../Controllers/memberController");
const validateToken = require("../middlewares/validateToken");
const checkAdminChurch = require("../middlewares/churchAdminRights");
const { permissions } = require("../utils/permissions");
const { authorize } = require("../middlewares/rolePermissionCheck");
const { storage } = require("../utils/storage");

const upload = multer({ storage: storage });
const router = express.Router();

router.post(
  "/create-member-onboarding",
  validateToken.validateToken,
  memberController.createMemberOnboarding,
);

router.post(
  "/:churchId/",
  validateToken.validateToken,
  checkAdminChurch,
  authorize(
    [
      permissions.member.create,
      permissions.member.view,
      permissions.member.update,
      permissions.member.delete,
    ],
    "all",
  ),
  memberController.addMember,
);

router.get(
  "/:churchId/me",
  validateToken.validateToken,
  authorize([permissions.member.view], "all"),
  memberController.getMe,
);

// Routes for member management
router
  .route("/:churchId/member/:id")
  .get(
    validateToken.validateToken,
    checkAdminChurch,
    authorize([permissions.member.view], "all"),
    memberController.getMember,
  )
  .patch(
    validateToken.validateToken,
    checkAdminChurch,
    authorize([permissions.member.update], "all"),
    memberController.updateMember,
  )
  .delete(
    validateToken.validateToken,
    checkAdminChurch,
    authorize([permissions.member.delete], "all"),
    memberController.deleteMember,
  );

router.delete(
  "/:churchId/members",
  validateToken.validateToken,
  checkAdminChurch,
  authorize([permissions.member.delete], "all"),
  memberController.batchDeleteMembers,
);

router.post(
  "/:id/profile-picture",
  validateToken.validateToken,
  upload.single("image"),
  memberController.uploadProfilePicture,
);

// Route to verify a member
router.patch(
  "/:churchId/member/:memberId/verify",
  validateToken.validateToken,
  checkAdminChurch,
  authorize([permissions.member.update], "all"),
  memberController.updateVerificationStatus,
);

// Routes for notes management
router
  .route("/:churchId/member/:id/note")
  .post(
    validateToken.validateToken,
    checkAdminChurch,
    authorize([permissions.member.create], "all"),
    memberController.addNoteToMember,
  )
  .get(
    validateToken.validateToken,
    checkAdminChurch,
    authorize([permissions.member.view], "all"),
    memberController.getMemberNotes,
  );

router
  .route("/:churchId/member/:id/note/:noteId")
  .patch(
    validateToken.validateToken,
    checkAdminChurch,
    authorize([permissions.member.update], "all"),
    memberController.updateNote,
  )
  .delete(
    validateToken.validateToken,
    checkAdminChurch,
    authorize([permissions.member.delete], "all"),
    memberController.deleteMemberNoteById,
  );

module.exports = router;
