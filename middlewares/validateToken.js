const MemberService = require("../services/member.service");
const TokenService = require("../services/Token.service");
const AppError = require("../utils/appError");

exports.validateToken = async (req, res, next) => {
  try {
    // 1. Check for authorization header presence:
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(new AppError("Please provide an authorization header", 401));
    }

    // 2. Extract and validate token format:
    const tokenParts = authorizationHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== "bearer") {
      return next(new AppError("Invalid authorization header format", 401));
    }
    const accessToken = tokenParts[1];

    // 3. Verify token using TokenService:
    const decoded = await TokenService.verifyAccessToken(accessToken);

    // 4. Attach decoded user information to request object:
    req.user = decoded;

    // Optional: Check if user is still in the database

    const MemberRole = await MemberService.getMemberRole(decoded.id);
    if (MemberRole) {
      req.role = MemberRole.name;
      req.roleId = MemberRole._id;
    }
    // 5. Proceed to next middleware:
    next();
  } catch (error) {
    // Handle potential errors:
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    if (error.message === "Invalid or expired access token") {
      return next(new AppError("Invalid or expired access token", 401));
    }
    // Handle other unexpected errors
    return next(new AppError("Internal server error", 500));
  }
};
