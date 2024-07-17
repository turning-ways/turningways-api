const User = require("../model/userModel");
const AppError = require("../utils/appError");

class UserService {
  static async createUser(data) {
    const userExists = await User.findOne({ email: data.email }).select(
      "+password",
    );
    if (userExists) throw new AppError("This email already exists..", 400);
    const user = await User.create(data);
    if (!user) {
      throw new AppError("User not created", 400);
    }
    return user;
  }

  static async createUserByPhone(data) {
    const user = new User(data);
    await user.save({ validateBeforeSave: false });

    if (!user) {
      throw new AppError("User not created", 400);
    }
    return user;
  }

  static async findUserByEmail(email) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  static async findUserByProviderId(providerId) {
    const user = await User.findOne({
      "externalProvider.provider.id": providerId,
    }).select("+password");
    if (!user) return null;
    return user;
  }

  static async findUserByPhone(phone) {
    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  static async checkVerificationStatus(email, phone, user) {
    if (email && !user.emailConfirmed) {
      throw new AppError(`Please verify your email ${email}`, 400);
    }
    if (phone && !user.isPhoneVerified) {
      throw new AppError("Please verify your phone number", 400);
    }
  }

  static async checkIfProviderEmailExists(email) {
    const user = await User.findOne({
      email,
      "externalProvider.provider.email": email,
    }).select("+password");
    console.log(user);
    if (!user) return null;
    return user;
  }

  static async findUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  static async updateUser(id, data) {
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  static async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
}

module.exports = UserService;
