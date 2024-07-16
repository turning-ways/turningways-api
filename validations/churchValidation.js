const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequests");

exports.churchOnBoardingValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("website").optional().isURL().withMessage("Valid URL is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("postalCode").notEmpty().withMessage("Postal code is required"),
  body("logo").optional().isURL().withMessage("Valid URL is required"),
  body("hasParentChurch")
    .isBoolean()
    .withMessage("hasParentChurch must be a boolean"),
  body("level").optional().isString().withMessage("Level ID must be a string"),
  body("parentChurch")
    .optional()
    .isString()
    .withMessage("Parent Church must be a string"),
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
