const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  const errorsArray = [];
  if (!errors.isEmpty()) {
    errors.array().map((err) =>
      errorsArray.push({
        field: err.path,
        error: err.msg,
      }),
    );

    return res.status(422).json({
      status: "error",
      message: "validation Error",
      errors: errorsArray,
    });
  }
  next();
};

module.exports = validateRequest;
