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
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: [true, "Church level is required"],
    },
    parentChurch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
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
      },
      phone: {
        type: String,
        unique: [true, "Phone number already exists"],
        sparse: true,
        minlength: [10, "Phone number must be 10 or more characters long"],
      },
    },
    settings: {
      website: {
        type: String,
        validate: [validator.isURL, "Please provide a valid URL"],
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
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

churchSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Church = mongoose.model("Church", churchSchema);

module.exports = Church;

// Todo: an admin can only be an admin to his own church
