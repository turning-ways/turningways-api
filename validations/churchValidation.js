const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequests");

exports.churchOnBoardingValidation = [
  body("churchData.name").notEmpty().withMessage("Name is required"),
  body("churchData.address").notEmpty().withMessage("Address is required"),
  body("churchData.email").isEmail().withMessage("Valid email is required"),
  body("churchData.phone").notEmpty().withMessage("Phone number is required"),
  body("churchData.website")
    .optional()
    .isURL()
    .withMessage("Valid URL is required"),
  body("churchData.city").notEmpty().withMessage("City is required"),
  body("churchData.state").notEmpty().withMessage("State is required"),
  body("churchData.country").notEmpty().withMessage("Country is required"),
  body("churchData.postalCode")
    .notEmpty()
    .withMessage("Postal code is required"),
  body("churchData.logo")
    .optional()
    .isURL()
    .withMessage("Valid URL is required"),
  body("churchData.hasParentChurch")
    .isBoolean()
    .withMessage("hasParentChurch must be a boolean"),
  body("churchData.level")
    .optional()
    .isString()
    .withMessage("Level ID must be a string"),
  body("churchData.parentChurch")
    .optional()
    .isString()
    .withMessage("Parent Church must be a string"),

  body("memberData.phone").notEmpty().withMessage("Phone number is required"),
  body("memberData.howDidYouHear")
    .notEmpty()
    .withMessage("How did you hear about us is required"),
  body("memberData.email").isEmail().withMessage("Valid email is required"),
  body("memberData.gender").notEmpty().withMessage("Gender is required"),
  body("memberData.dateOfBirth")
    .notEmpty()
    .withMessage("Date of Birth is required"),
  validateRequest,
];

exports.churchUpdateValidation = [
  body("name").optional().notEmpty().withMessage("Name is required"),
  body("address").optional().notEmpty().withMessage("Address is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("phone").optional().notEmpty().withMessage("Phone number is required"),
  body("website").optional().isURL().withMessage("Valid URL is required"),
  body("city").optional().notEmpty().withMessage("City is required"),
  body("state").optional().notEmpty().withMessage("State is required"),
  body("country").optional().notEmpty().withMessage("Country is required"),
  body("postalCode")
    .optional()
    .notEmpty()
    .withMessage("Postal code is required"),
  body("logo").optional().isURL().withMessage("Valid URL is required"),
  body("hasParentChurch")
    .optional()
    .isBoolean()
    .withMessage("hasParentChurch must be a boolean"),
  body("level").optional().isString().withMessage("Level ID must be a string"),
  body("parentChurch")
    .optional()
    .isString()
    .withMessage("Parent Church must be a string"),
  body("website").optional().isURL().withMessage("Valid URL is required"),
  body("logo").optional().isURL().withMessage("Valid URL is required"),
  body("facebook").optional().isURL().withMessage("Valid URL is required"),
  body("twitter").optional().isURL().withMessage("Valid URL is required"),
  body("instagram").optional().isURL().withMessage("Valid URL is required"),
  body("youtube").optional().isURL().withMessage("Valid URL is required"),
  body("linkedin").optional().isURL().withMessage("Valid URL is required"),
  validateRequest,
];
