const Member = require("../model/contactModel");
const Role = require("../model/roleModel");

exports.PermissionCheck =
  (...permission) =>
  (req, res, next) => {
    // get the Member with the user id
    const member = Member.findOne({
      userId: req.user.id,
      contactType: "member",
    });
    // get the role of the member
    const role = Role.findById(member.orgRole);
    // check if the role has the permission
    const hasPermission = role.permissions.some((p) => permission.includes(p));
    if (!hasPermission) {
      return res.status(403).json({
        status: "error",
        message: "You do not have the permission to perform this action",
      });
    }

    next();
  };
