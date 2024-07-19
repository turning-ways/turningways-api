const express = require("express");
const multer = require("multer");
const memberController = require("../Controllers/memberController");
const validateToken = require("../middlewares/validateToken");
const checkAdminChurch = require("../middlewares/churchAdminRights");
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
  memberController.addMember,
);

router.get("/me", validateToken.validateToken, memberController.getMe);

// Routes for member management
router
  .route("/:churchId/member/:id")
  .get(
    validateToken.validateToken,
    checkAdminChurch,
    memberController.getMember,
  )
  .patch(
    validateToken.validateToken,
    checkAdminChurch,
    memberController.updateMember,
  )
  .delete(
    validateToken.validateToken,
    checkAdminChurch,
    memberController.deleteMember,
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
  memberController.updateVerificationStatus,
);

// Routes for notes management
router
  .route("/:churchId/member/:id/note")
  .post(
    validateToken.validateToken,
    checkAdminChurch,
    memberController.addNoteToMember,
  )
  .get(
    validateToken.validateToken,
    checkAdminChurch,
    memberController.getMemberNotes,
  );

router
  .route("/:churchId/member/:id/note/:noteId")
  .patch(
    validateToken.validateToken,
    checkAdminChurch,
    memberController.updateNote,
  )
  .delete(
    validateToken.validateToken,
    checkAdminChurch,
    memberController.deleteMemberNoteById,
  );

module.exports = router;
