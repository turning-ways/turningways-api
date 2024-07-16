const { body } = require("express-validator");

const userValidation = {
  signUp: [
    body("firstName").notEmpty().withMessage("First Name is required"),
    body("lastName").notEmpty().withMessage("Last Name is required"),
    body("email").isEmail().withMessage("Email is invalid"),
    body("password").isLength({ min: 8 }).withMessage("Password is too short"),
    body("passwordConfirm").custom((value, { req }) => {
      if (value === undefined || value === "") {
        throw new Error("PasswordConfirm cannot be empty");
      }

      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  login: [
    body("inputKey").notEmpty().withMessage("Email or Phone is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  resetPassword: [
    body("password").isLength({ min: 8 }).withMessage("Password is too short"),
    body("passwordConfirm").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
};

module.exports = userValidation;
