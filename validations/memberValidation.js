const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequests");

exports.memberOnboardingValidation = [
  body("churchId").notEmpty().withMessage("Church ID is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("howDidYouHear")
    .notEmpty()
    .withMessage("How did you hear about us is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("gender").notEmpty().withMessage("Gender is required"),
  body("dateOfBirth").notEmpty().withMessage("Date of Birth is required"),
  validateRequest,
];

const genderEnum = ["male", "female"];
const maritalStatusEnum = ["single", "married", "divorced", "widowed"];

exports.addMemberValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("suffix").optional(),
  body("prefix").optional(),
  body("gender")
    .isIn(genderEnum)
    .withMessage(
      `Gender must be one of the following: ${genderEnum.join(", ")}`,
    ),
  body("maritalStatus")
    .optional()
    .isIn(maritalStatusEnum)
    .withMessage(
      `Marital status must be one of the following: ${maritalStatusEnum.join(", ")}`,
    ),
  body("dateOfBirth").notEmpty().withMessage("Date of Birth is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("address").optional().notEmpty().withMessage("Address is required"),
  body("workerStatus").optional().isBoolean(),
  body("educationLevel").optional(),
  body("employmentStatus").optional(),
  body("createdBy").notEmpty().withMessage("The creator's ID is required"),
  validateRequest,
];

exports.updateMemberValidation = [
  body("firstName").optional().notEmpty().withMessage("First name is required"),
  body("lastName").optional().notEmpty().withMessage("Last name is required"),
  body("suffix").optional(),
  body("prefix").optional(),
  body("gender")
    .optional()
    .isIn(genderEnum)
    .withMessage(
      `Gender must be one of the following: ${genderEnum.join(", ")}`,
    ),
  body("maritalStatus")
    .optional()
    .isIn(maritalStatusEnum)
    .withMessage(
      `Marital status must be one of the following: ${maritalStatusEnum.join(", ")}`,
    ),
  body("dateOfBirth")
    .optional()
    .notEmpty()
    .withMessage("Date of Birth is required"),
  body("phone").optional().notEmpty().withMessage("Phone number is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("address").optional().notEmpty().withMessage("Address is required"),
  body("workerStatus")
    .optional()
    .isBoolean()
    .withMessage("Worker status must be a boolean"),
  body("educationLevel").optional(),
  body("employmentStatus").optional(),
  body("modifiedBy").notEmpty().withMessage("The modifier's ID is required"),
  validateRequest,
];
