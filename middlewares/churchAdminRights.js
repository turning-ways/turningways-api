const MemberService = require("../services/member.service");
const AppError = require("../utils/appError"); // Assuming you have a custom error class

const checkAdminChurch = async (req, res, next) => {
  try {
    // Extract churchId from params or body
    const churchId = req.params.churchId || req.body.churchId;
    if (!churchId) {
      return next(new AppError("Church ID is required", 400));
    }
    // Extract user from request
    const { user } = req;
    if (!user || !user.id) {
      return next(new AppError("User information is missing", 401));
    }

    // Find member by user ID
    const member = await MemberService.findMemberByUserId(user.id);
    if (!member) {
      return next(new AppError("Member not found", 404));
    }

    // Check if the member's churchId matches the provided churchId
    if (member.churchId.toString() !== churchId) {
      return next(
        new AppError("User does not belong to the specified church", 403),
      );
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkAdminChurch;
