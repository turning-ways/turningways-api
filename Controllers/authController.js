/* eslint-disable node/no-unpublished-require */
const catchAsync = require("../utils/catchAsync");
const UserService = require("../services/user.service");
const TokenService = require("../services/Token.service");
const AuthService = require("../services/authHelp.service");
const validateRequest = require("../middlewares/validateRequests");
const {
  emailValidation,
  tokenValidation,
  passwordResetValidation,
} = require("../validations/authValidation");
const userValidation = require("../validations/userValidation");
const authSuccess = require("../utils/Redirection");

// Initialize Cookie Options
const CookieOptions = {
  httpOnly: true,
  sameSite: "None",
  secure: true,
};

// Initialize Firebase Admin

exports.SignUp = [
  userValidation.signUp,
  validateRequest,
  catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;
    await UserService.createUser({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role: "admin",
    });
    res
      .status(201)
      .json({ status: "success", message: "User created, check your Mail" });
  }),
];

exports.Login = [
  userValidation.login,
  validateRequest,
  catchAsync(async (req, res, next) => {
    const { inputKey, password } = req.body;
    // Service to handle the login
    const user = await AuthService.login(inputKey, password);
    if (user.status && user.status === "error") {
      return res.status(401).json({
        status: "error",
        message: "Invalid Credentials",
      });
    }

    // Generate The Token
    const accessToken = await TokenService.generateAccessToken(
      user,
      user.mainChurch,
    );
    const refreshToken = await TokenService.generateRefreshToken(user);
    authSuccess.handleLogin(accessToken, refreshToken, user, res);
  }),
];

exports.RefreshToken = [
  catchAsync(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    const { rc } = req.body;
    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Access denied: No token provided.",
      });
    }
    let user;
    if (!rc) {
      user = await TokenService.verifyRefreshToken(refreshToken);
    } else {
      user = await TokenService.verifyRefreshToken(rc);
    }

    const userExists = await UserService.findUserById(user.id);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Access denied: Invalid token.",
      });
    }
    const accessToken = await TokenService.generateAccessToken(
      userExists,
      userExists.mainChurch,
    );
    const newRefreshToken = await TokenService.generateRefreshToken(userExists);
    res
      .status(200)
      .cookie("refreshToken", newRefreshToken, CookieOptions)
      .json({
        status: "success",
        accessToken,
      });
  }),
];

// ----------------- Phone Firebase Authentication -----------------
exports.phoneAuthAdmin = catchAsync(async (req, res, next) => {
  const { uid, password, passwordConfirm } = req.body;

  const user = await AuthService.firebasePhoneAuthenticattion(
    uid,
    password,
    passwordConfirm,
    "admin",
  );

  res.status(201).json({
    status: "success",
    message: "User created",
    data: {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// ----------------- Email Verification -----------------
exports.sendVerificationEmail = [
  emailValidation,
  catchAsync(async (req, res, next) => {
    const { email } = req.body;
    await AuthService.sendVerificationEmail(email);
    res.status(200).json({ status: "success", message: "Email sent" });
  }),
]; // To send the verification email

exports.verifyEmail = [
  tokenValidation,
  catchAsync(async (req, res, next) => {
    const { token } = req.body;
    await AuthService.verifyEmail(token);
    res.status(200).json({ status: "success", message: "Email verified" });
  }),
];

// ----------------- Password Reset -----------------
exports.sendResetPassword = [
  emailValidation,
  catchAsync(async (req, res, next) => {
    const { email } = req.body;
    await AuthService.sendResetPassword(email);
    res.status(200).json({ status: "success", message: "Email sent" });
  }),
];

exports.verifyPasswordResetToken = [
  tokenValidation,
  catchAsync(async (req, res, next) => {
    const { token } = req.body;
    const userId = await AuthService.verifyPasswordResetToken(token);
    res
      .status(200)
      .json({ status: "success", message: "Token Verified", userId });
  }),
];

exports.resetPassword = [
  passwordResetValidation,
  catchAsync(async (req, res, next) => {
    const { password, passwordConfirm } = req.body;
    const { userId } = req.params;
    await AuthService.resetPassword(userId, password, passwordConfirm);
    res.status(200).json({ status: "success", message: "Password Reset" });
  }),
];

// ------------------- Invitation -----------------------------
exports.checkInvitation = catchAsync(async (req, res, next) => {
  const { token, sub } = req.query;
  await AuthService.checkInvitation(token, sub);
  res.status(200).json({ status: "success", message: "Invitation Valid" });
});

exports.acceptInvitation = catchAsync(async (req, res, next) => {
  const { token, sub } = req.query;
  const user = await AuthService.acceptInvitation(token, sub);
  res.status(200).json({
    status: "success",
    message: "Invitation Accepted",
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

exports.Logout = async (req, res) => {
  console.log(req.user);
  const user = await UserService.findUserById(req.user.id);
  user.token = undefined;
  await user.save();
  res
    .status(200)
    .clearCookie("refreshToken", CookieOptions)
    .json({ message: "User logged out" });
};

// exports.protect = passport.authenticate("jwt", { session: false });
