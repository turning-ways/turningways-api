const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
// eslint-disable-next-line node/no-unpublished-require
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
  },
  phone: {
    type: String,
    unique: [true, "Phone number already exists"],
    sparse: true,
    minlength: [10, "Phone number must be 10 or more characters long"],
  },
  photo: {
    type: String,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  emailConfirmationToken: {
    type: String,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  token: String,
  externalProvider: {
    provider: {
      name: {
        type: String,
        required: false,
      },
      id: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        sparse: true,
        validate: [validator.isEmail, "Please provide a valid email"],
      },
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
    minlength: [8, "Password must be 8 or more characters long"],
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  PasswordResetToken: {
    type: String,
    required: false,
  },
  PasswordResetExpires: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    immutable: true,
  },
  role: {
    type: String,
    enum: ["admin", "member", "sub-admin"],
    default: "member",
    required: true,
    index: true,
  },
  mainChurch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Church",
    // if role is not admin , this should be undefined
    validate: {
      validator: function () {
        return this.role === "admin";
      },
      message: "Only Admins can have a main church",
    },
    index: true,
  },
  churches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      index: true,
    },
  ],
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ emailConfirmationToken: 1 });
userSchema.index({ "externalProvider.email": 1 });
userSchema.index({ "externalProvider.id": 1 });
userSchema.index({ churches: 1 });
userSchema.index({ mainChurch: 1 });
// compound index
userSchema.index({ email: 1, phone: 1 });
userSchema.index({ email: 1, phone: 1, "externalProvider.email": 1 });
userSchema.index({ email: 1, "externalProvider.email": 1 });

// Document middleware
// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(
    this.password,
    Number(process.env.HASH_SALT),
  );
  this.passwordConfirm = undefined;
  next();
});

// instance Method
// To check if the password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// To generate an email Confirmation Token
userSchema.methods.createEmailConfirmationToken = function () {
  const confirmationToken = Math.floor(1000 + Math.random() * 9000);

  this.emailConfirmationToken = crypto
    .createHash("sha256")
    .update(confirmationToken.toString())
    .digest("hex");
  return confirmationToken;
};

// To verify the email Confirmation Token
userSchema.methods.verifyEmailConfirmationToken = function (token) {
  if (token === this.emailConfirmationToken) {
    this.emailConfirmed = true;
    this.emailConfirmationToken = undefined;
    return true;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = Math.floor(1000 + Math.random() * 9000);

  this.PasswordResetToken = crypto
    .createHash("sha256")
    .update(resetToken.toString())
    .digest("hex");

  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// TODO: Delete this, when the firebase phone auth has been implemented
// userSchema.methods.createPhoneConfirmationToken = function () {
//   const confirmationToken = Math.floor(1000 + Math.random() * 9000);

//   this.phoneConfirmationToken = crypto
//     .createHash("sha256")
//     .update(confirmationToken.toString())
//     .digest("hex");
//   this.phoneConfirmedTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//   return confirmationToken;
// };

// TODO: Delete this, when the firebase phone auth has been implemented
// userSchema.methods.verifyPhoneConfirmationToken = function (token) {
//   if (token === this.phoneConfirmationToken) {
//     this.isPhoneVerified = true;
//     this.phoneConfirmationToken = undefined;
//     this.phoneConfirmedTokenExpires = undefined;
//     return true;
//   }
//   return false;
// };

// Pre save hook
// if the user is created from an external provider and the email is the same as any other email in the external provider, we just sync the email
userSchema.pre("save", async function (next) {
  if (this.externalProvider.email) {
    const user = await this.constructor.findOne({
      email: this.externalProvider.email,
    });
    if (user) {
      this.email = this.externalProvider.email;
    }
  }
  next();
});

// Sync the emails of the external provider to the user email
userSchema.pre("save", function (next) {
  if (this.externalProvider.email) {
    this.email = this.externalProvider.email;
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
