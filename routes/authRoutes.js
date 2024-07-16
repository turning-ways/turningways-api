const express = require("express");
const passport = require("../passport");
const ac = require("../Controllers/authController");
const authServices = require("../services/authHelp.service");
const { validateToken } = require("../middlewares/validateToken");

const router = express.Router();

// -----------Auth Routes-----------
router.post("/auth/admin/signup", ac.SignUp);
router.post("/auth/admin/phone", ac.phoneAuthAdmin);
router.post("/auth/verify-email", ac.sendVerificationEmail);
router.patch("/auth/verify", ac.verifyEmail);
router.post("/auth/login", ac.Login);
router.post("/auth/refresh", ac.RefreshToken);
router.get("/auth/logout", validateToken, ac.Logout);

// -----------Google Auth Routes-----------
router.get(
  "/auth/google/admin",
  passport.authenticate("admin-google", { scope: ["profile", "email"] }),
);

router.get(
  "/auth/google/admin/callback",
  passport.authenticate("admin-google", {
    failureRedirect: "https://www.turningways.com",
  }),
  async (req, res) => {
    await authServices.handleGoogleAdminCallback(req.user, res);
  },
);

// -----------Password Reset Routes-----------
router.post("/auth/forgot-password", ac.sendResetPassword);
router.patch("/auth/verify-password-token", ac.verifyPasswordResetToken);
router.patch("/auth/reset-password/:userId", ac.resetPassword);

// -----------Protected Route-----------
router.get("/profile", validateToken, (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      message: "You are authenticated",
      user: req.user,
    });
  }
  return res.json({ message: "You are not authenticated" });
});

module.exports = router;
