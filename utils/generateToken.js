const jwt = require("jsonwebtoken");
const Member = require("../Model/MemberModel");

const generateToken = (user) => {
  // get the ChurchId
  const member = Member.findOne({ userId: user._id });
  const churchId = member ? member.churchId : null;
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    churchId: churchId,
  };
  const isAdmin = user.role === "admin";
  const hasChurchId = churchId !== null;
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES_IN,
  });

  return {
    token,
    isAdmin,
    hasChurchId,
  };
};

module.exports = { generateToken };
