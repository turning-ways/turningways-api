const Member = require("../model/contactModel");
const Role = require("../model/roleModel");
const AppError = require("../utils/appError");
const { logger } = require("../utils/logger");

const authorize =
  (permissions, condition = "any") =>
  async (req, res, next) => {
    const { user } = req;
    const { churchId } = req.params;

    // check if the user is a member of the church
    const member = await Member.findOne({
      userId: user.id,
      churchId: churchId,
    });

    // if the user is not a member of the church, return an error
    if (!member) {
      return res.status(403).json({
        message: "You are not authorized to perform this action, now",
      });
    }

    // get the role of the member
    const role = await Role.findById(member.orgRole._id);
    if (!role) {
      return next(new AppError("Role not found", 404));
    }

    // if the condition is "all", the user must have all the permissions and the role must match the condition
    if (condition === "all") {
      const hasAllPermissions = permissions.every((permission) =>
        role.permissions.includes(permission),
      );
      if (!hasAllPermissions) {
        logger.error(
          `Member with id - ${member._id} and role ${role.name} does not have the required permissions`,
        );
        return next(
          new AppError("You are not authorized to perform this action", 403),
        );
      }
    }

    // if the condition is "any", the user must have at least one of the permissions and the role must match the condition
    if (condition === "any") {
      const hasAnyPermission = permissions.some((permission) =>
        role.permissions.includes(permission),
      );
      if (!hasAnyPermission) {
        logger.error(
          `Member with id - ${member._id} and role ${role.name} does not have the required permissions`,
        );
        return next(
          new AppError("You are not authorized to perform this action", 403),
        );
      }
    }

    next();
  };

exports.authorize = authorize;
