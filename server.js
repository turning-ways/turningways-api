const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const express = require("express");
const session = require("express-session");
const { connectDB } = require("./db");
const passport = require("./passport");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorController");
const { logger } = require("./utils/logger");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

const app = express();

// Database connection AND PORT
const PORT = process.env.PORT || 3001;

// -------------- Logging --------------
app.use(
  morgan((tokens, req, res) => {
    const msg = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
    logger.http(msg);
    return null;
    // return msg;
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
// -------------- Middlewares --------------
app.use(cors()); // Enable All CORS Requests
app.use(helmet()); // Secure HTTP headers
app.use(limiter); // Limit requests from an IP
app.use(
  session({
    secret: process.env.JWT_SECRET, // A secret key to sign the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Always create a session to ensure the cookie is set
    cookie: {
      secure: true,
    }, // Secure cookie
  }),
); // Session middleware
app.use(express.json()); // Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names

app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Session middleware

// ------------- Routes -------------
// ------------- v1 -------------
app.use("/api/v1", require("./routes/authRoutes")); // User routes
app.use("/api/v1/churches", require("./routes/churchRoutes")); // Church routes
app.use("/api/v1/members", require("./routes/memberRoutes")); // Member routes
app.use("/api/v1/contacts", require("./routes/contactRoutes")); // Contact routes

// 404 route
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

connectDB()
  .then(() => {
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      logger.info("Logging Started 🚀");
    });
  })
  .catch((error) => {
    console.error(error);
  });

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  process.exit(1);
});
