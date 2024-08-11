// utils/TokenService.js
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const MemberService = require("./member.service");
const AppError = require("../utils/appError");

class TokenService {
  static async generateAccessToken(user, churchId) {
    const MemberRole = await MemberService.getMemberRole(user._id, churchId);
    let memberRoleName = null;
    if (MemberRole) {
      memberRoleName = MemberRole.name;
      // permissions = MemberRole.permissions;
    }
    const payload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      MemberRole: memberRoleName,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
    // user.token = token;
    // await user.save({ validateBeforeSave: false });

    return token;
  }

  static async generateRefreshToken(user) {
    const payload = {
      id: user._id,
    };
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  static async generateRefreshTokenWithId(id) {
    const payload = {
      id,
    };
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  static async verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // const userTokenExists = await User.find({
      //   _id: decoded.id,
      //   token: token,
      // });
      // if (!userTokenExists) {
      //   throw new Error("Invalid or expired access token");
      // }

      return decoded;
    } catch (error) {
      throw new AppError("Invalid or expired access token", 401);
    }
  }

  static async verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  static async refreshTokens(refreshToken) {
    const decoded = await this.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    return { newAccessToken, newRefreshToken };
  }
}

module.exports = TokenService;
