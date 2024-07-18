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
  "/",
  validateToken.validateToken,
  checkAdminChurch,
  memberController.addMember,
);

router.get("/me", validateToken.validateToken, memberController.getMe);

// Routes for member management
router
  .route("/:id")
  .get(
    validateToken.validateToken,
    checkAdminChurch,
    memberController.getMember,
  )
  .patch(validateToken.validateToken, memberController.updateMember)
  .delete(validateToken.validateToken, memberController.deleteMember);

router.post(
  "/:id/profile-picture",
  validateToken.validateToken,
  upload.single("image"),
  memberController.uploadProfilePicture,
);

// Route to verify a member
router.patch(
  "/:memberId/verify",
  validateToken.validateToken,
  memberController.updateVerificationStatus,
);

// Routes for notes management
router
  .route("/:id/note")
  .post(validateToken.validateToken, memberController.addNoteToMember)
  .get(validateToken.validateToken, memberController.getMemberNotes);

router
  .route("/:id/note/:noteId")
  .patch(validateToken.validateToken, memberController.updateNote)
  .delete(validateToken.validateToken, memberController.deleteMemberNoteById);

module.exports = router;
