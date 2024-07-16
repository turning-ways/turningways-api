const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequests");

exports.createContactValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string"),
  body("phone").custom((value) => {
    // must have the country code
    if (!value.startsWith("+")) {
      throw new Error("Phone number must have the country code");
    }
    return true;
  }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("gender")
    .optional()
    .isString()
    .isIn(["male", "female"])
    .withMessage("Gender must be male or female!"),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("maturityLevel")
    .optional()
    .isString()
    .withMessage("Maturity level must be a string"),
  body("createdBy").notEmpty().withMessage("Created by is required"),
  validateRequest,
];

exports.updateContactValidation = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string"),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("memberStatus")
    .optional()
    .isString()
    .withMessage("Member status is required"),
  body("contactStatus")
    .optional()
    .isString()
    .withMessage("Contact status is required"),
  body("gender")
    .optional()
    .isString()
    .isIn(["male", "female"])
    .withMessage("Gender must be male or female!"),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("maturityLevel")
    .optional()
    .isString()
    .withMessage("Maturity level must be a string"),
  body("modifiedBy").notEmpty().withMessage("Modified by is required"),
  validateRequest,
];

exports.createNoteValidation = [
  body("note").notEmpty().withMessage("Note is required"),
  body("createdBy").notEmpty().withMessage("Created by is required"),
  validateRequest,
];

exports.updateNoteValidation = [
  body("note").optional().isString().withMessage("Note must be a string"),
  body("modifiedBy").notEmpty().withMessage("Modified by is required"),
  validateRequest,
];
