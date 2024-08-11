/* eslint-disable node/no-unpublished-require */
const crypto = require("crypto");
const validator = require("validator");
const admin = require("firebase-admin");
const moment = require("moment");
const mongoose = require("mongoose");
const TokenService = require("./Token.service");
const serviceAccount = require("../config/firebase-admin");
const User = require("../model/userModel");
const Invitation = require("../model/invitationModel");
const Contact = require("../model/contactModel");
const AppError = require("../utils/appError");
const { sendMail } = require("../utils/email");
const {
  emailVerification,
  forgotPasswordEmail,
} = require("../utils/emailTemplates");
const UserService = require("./user.service");
const { logger } = require("../utils/logger");

const CookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: true,
};

class AuthService {
  static async login(inputKey, password) {
    const email = validator.isEmail(inputKey) ? inputKey : null;
    const phone = !email ? inputKey : null;
    let user;
    if (email) {
      user = await UserService.findUserByEmail(email);
    } else {
      let phoneNumber;
      if (phone.startsWith("+")) {
        phoneNumber = phone.slice(1); // remove the + sign from the phone number
      }
      user = await UserService.findUserByPhone(phoneNumber);
    }
    if (!user || !(await user.correctPassword(password, user.password))) {
      return {
        status: "error",
      };
    }

    await UserService.checkVerificationStatus(email, phone, user);

    return user;
  }

  static async firebasePhoneAuthenticattion(
    uid,
    password,
    passwordConfirm,
    role,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    // Get the user from the firebase admin
    const userFirebase = await admin.auth().getUser(uid);
    if (!userFirebase)
      throw new AppError(
        "Error try using a different authentication method",
        400,
      );

    // check if the userFirebase phone number is exists
    if (!userFirebase.phoneNumber)
      throw new AppError("Phone number not found", 400);
    let { phoneNumber } = userFirebase;
    if (phoneNumber.startsWith("+")) {
      phoneNumber = phoneNumber.slice(1); // remove the + sign from the phone number
    }

    // check if the user exists in the database
    const Phoneuser = await User.findOne({ phone: phoneNumber });
    if (Phoneuser) throw new AppError("User already exists", 400);

    // if the user does not exist, check if the password and passwordConfirm match
    if (password !== passwordConfirm)
      throw new AppError("Passwords do not match", 400);

    // create the user
    const firstName = userFirebase.displayName.split(" ")[0];
    const lastName = userFirebase.displayName.split(" ")[1];

    const user = await UserService.createUserByPhone({
      firstName,
      lastName,
      phone: phoneNumber,
      password,
      passwordConfirm,
      role,
      isPhoneVerified: true,
    });
    return user;
  }

  static async sendVerificationEmail(email) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError("User not found", 404);

    const token = user.createEmailConfirmationToken();
    const html = emailVerification(token);

    await sendMail({
      email: email,
      subject: "Email Verification",
      html,
    });

    await user.save({ validateBeforeSave: false });
  }

  static async verifyEmail(token) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token.toString())
      .digest("hex");
    const user = await User.findOne({ emailConfirmationToken: hashedToken });
    if (!user || !user.verifyEmailConfirmationToken(hashedToken)) {
      throw new AppError("Invalid Token", 400);
    }
    await user.save({ validateBeforeSave: false });
  }

  static async sendResetPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError("User not found", 404);

    const resetToken = user.createPasswordResetToken();
    const html = forgotPasswordEmail(resetToken);
    try {
      await sendMail({
        email: email,
        subject: "Password Reset",
        html,
      });
    } catch (error) {
      user.PasswordResetToken = undefined;
      user.PasswordResetExpires = undefined;
      logger.error(`Could not send Password Reset Email - ${error}`);
      throw new AppError("Error occured while sending email", 400);
    }

    await user.save({ validateBeforeSave: false });
  }

  static async verifyPasswordResetToken(token) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      PasswordResetToken: hashedToken,
      PasswordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new AppError("Invalid Token", 400);
    return user._id;
  }

  static async resetPassword(userId, password, passwordConfirm) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new AppError("User not found", 404);

    if (user.PasswordResetExpires < Date.now() || !user.PasswordResetToken) {
      throw new AppError("Token has expired", 400);
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save();
  }

  static async checkInvitation(token, id) {
    const invitation = await Invitation.findOne({ _id: id, token });
    if (!invitation) throw new AppError("Invalid Token", 400);
    return invitation;
  }

  static async acceptInvitation(email, password, passwordConfirm, token, id) {
    const invitation = await this.checkInvitation(token, id);

    // check the member is already registered
    const contact = await Contact.findOne({
      _id: invitation.contactId,
    });

    if (!contact) throw new AppError("Contact not found", 404);

    // create user
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) throw new AppError("User already exists", 400);

      const newUser = await User.create(
        [
          {
            email,
            password,
            passwordConfirm,
            firstName: contact.firstName,
            lastName: contact.lastName,
            emailConfirmed: true,
            role: "member",
            churches: [invitation.churchId],
          },
        ],
        { session },
      );

      if (!newUser) throw new AppError("An Error Occured", 500);

      // update contact
      contact.userId = newUser[0]._id;

      invitation.accepted = true;
      invitation.acceptedAt = moment.format();

      await invitation.save({ session });
      await contact.save({ session });
      await session.commitTransaction();
      session.endSession();
      return newUser;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError("User already exists", 400);
    }
  }

  // services/authService.js

  static async handleGoogleAdminCallback(user, res) {
    try {
      // console.log("User", user);
      // Check if user is a member
      const member = await Contact.findOne({
        userId: user._id,
        contactType: "member",
      }).populate("orgRole", "name");

      console.log("Member", member);

      const accessToken = await TokenService.generateAccessToken(user);
      const refreshToken = await TokenService.generateRefreshToken(user);

      // If the user is an admin, redirect to the admin dashboard
      if (member && member.orgRole.name !== "Member") {
        res.redirect(
          `http://localhost:5173/auth/google/verify?id=${user._id.toString()}&token=${accessToken}&churchId=${member.churchId}&redirectUrl=http://localhost:5173/admin/dashboard/today`,
        );
        return;
      }

      if (member && member.orgRole.name === "Member") {
        res.redirect(
          `http://localhost:5173/auth/google/verify?id=${user._id.toString()}&token=${accessToken}&churchId=${member.churchId}&redirectUrl=http://localhost:5173/member/dashboard/today`,
        );
        return;
      }

      // If the user is not an admin, redirect to the home
      if (!member && user.role !== "admin") {
        return res.status(200).redirect("https://www.turningways.com");
      }

      // if the user is a user but does not have a mainChurch
      if (user.role === "admin" && !user.mainChurch) {
        return res
          .status(200)
          .cookie("refreshToken", refreshToken, CookieOptions)
          .redirect(
            `https://www.turningways.com/register/personalinfo?t=${refreshToken}`,
          );
      }

      // res.status(200).redirect("https://www.turningways.com");
    } catch (error) {
      console.error("Error in handleGoogleAdminCallback:", error);

      // Handle any errors that occurred while finding the member
      return res.status(500).json({
        status: "error",
        message: "An error occurred while processing your request",
      });
    }
  }

  static async validateExternalProvider(token, churchId, redirectUrl) {
    // Check if the token is valid
    const isValid = await TokenService.verifyAccessToken(token);
    // If the token is not valid, redirect to the login page
    if (!isValid) {
      return null;
    }

    return {
      churchId,
      redirectUrl,
    };
  }
}

module.exports = AuthService;
