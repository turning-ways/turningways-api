const AppError = require("../utils/appError");
const { logger } = require("../utils/logger");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  const message = "Invalid Token. Please Log In again to Continue";
  return new AppError(message, 401);
};

const handleJWTExpiredError = () => {
  const message = "Token has expired. Please Log In again to Continue";
  return new AppError(message, 401);
};
/**
 * The sendErrorDev function is used to send error messages in development mode.
 *
 *
 * @param err Get the statuscode, message and stack of the error
 * @param res Send the response to the client
 *
 * @return An error object with the following properties:
 *
 * @docauthor Trelent
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * The sendErrorProd function is used to send a production error response.
 *
 *
 * @param err Pass the error object to the function
 module
 * @param res Send the response to the client
 *
 * @return An object with the status and message properties
 *
 * @docauthor Brunex790
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (err.name === "CastError") error = handleCastErrorDB(err);

    if (err.code === 11000) error = handleDuplicateFields(err);

    if (err.name === "ValidationError") error = handleValidationError(err);

    if (err.name === "JsonWebTokenError") error = handleJWTError(err);

    if (err.name === "TokenExpiredError") error = handleJWTExpiredError(err);

    sendErrorProd(error, res);
  }
};
