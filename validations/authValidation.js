const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequests");

// Error handling middleware

const emailValidation = [
  body("email").isEmail().withMessage("Email is invalid"),
  validateRequest,
];

const tokenValidation = [
  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .isLength({ min: 4, max: 7 })
    .withMessage("Token is invalid"),
  validateRequest,
];

const passwordResetValidation = [
  body("password").isLength({ min: 8 }).withMessage("Password is too short"),
  body("passwordConfirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  validateRequest,
];

module.exports = {
  emailValidation,
  tokenValidation,
  passwordResetValidation,
};
