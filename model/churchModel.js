/* eslint-disable node/no-unpublished-require */
const mongoose = require("mongoose");
const validator = require("validator");

const churchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Church name is required"],
    },
    isHQ: {
      type: Boolean,
      default: false,
      index: true,
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: [true, "Church level is required"],
      index: true,
    },
    parentChurch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      index: true,
    },
    location: {
      address: {
        type: String,
        required: [true, "Church address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
      postalCode: {
        type: String,
        required: [true, "Postal code is required"],
      },
    },
    contact: {
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"],
        index: true,
      },
      phone: {
        type: String,
        unique: [true, "Phone number already exists"],
        sparse: true,
        minlength: [10, "Phone number must be 10 or more characters long"],
        index: true,
      },
    },
    settings: {
      website: {
        type: String,
        validate: [validator.isURL, "Please provide a valid URL"],
      },
      theme: {
        type: String,
        default: "default",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
      logo: {
        type: String,
      },
      socialMedia: {
        facebook: {
          type: String,
          validate: [validator.isURL, "Please provide a valid URL"],
        },
        twitter: {
          type: String,
          validate: [validator.isURL, "Please provide a valid URL"],
        },
        instagram: {
          type: String,
          validate: [validator.isURL, "Please provide a valid URL"],
        },
        linkedin: {
          type: String,
          validate: [validator.isURL, "Please provide a valid URL"],
        },
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Add indexes
churchSchema.index({ level: 1 }); // Index on level field
churchSchema.index({ parentChurch: 1 }); // Index on parentChurch field
churchSchema.index({ createdAt: 1 }); // Index on createdAt field
churchSchema.index({ updatedAt: 1 }); // Index on updatedAt field
churchSchema.index({ isDeleted: 1 }); // Index on isDeleted field
churchSchema.index({ createdAt: 1, isDeleted: 1 }); // Compound index for querying ranges and deletion status

// Make search index for the name field
churchSchema.index({ name: "text" });

churchSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Church = mongoose.model("Church", churchSchema);

module.exports = Church;
