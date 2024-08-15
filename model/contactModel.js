/* eslint-disable node/no-unpublished-require */
const mongoose = require("mongoose");
const validator = require("validator");
const AppError = require("../utils/appError");
const User = require("./userModel");
// const Church = require("./churchModel");

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // Index on userId
    },
    churchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: true,
      index: true, // Index on churchId
    },
    orgRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      index: true, // Index on orgRole
    },
    profile: {
      firstName: {
        type: String,
        trim: true,
        required: [true, "First name is required"],
        index: true, // Index on firstName
      },
      middleName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
        index: true, // Index on lastName
      },
      photo: {
        type: String,
      },
      suffix: {
        type: String,
      },
      prefix: {
        type: String,
      },
      gender: {
        type: String,
        enum: ["male", "female"],
      },
      dateOfBirth: Date,
      maritalStatus: {
        type: String,
        enum: ["single", "married", "divorced", "widowed", "undefined"],
        default: "undefined",
      },
      anniversaries: [
        {
          name: String,
          date: Date,
        },
      ],
      address: {
        homeAddress: String,
        workAddress: String,
      },
      phone: {
        mainPhone: {
          type: String,
          minlength: [10, "Phone number must be 10 characters long"],
          required: [true, "Main phone number is required"],
          validate: {
            validator: async function (value) {
              const contact = await this.constructor.findOne({
                "profile.phone.mainPhone": value,
                churchId: this.churchId,
                _id: { $ne: this._id },
              });
              return !contact;
            },
            message:
              "Phone number already exists for another contact in the church",
          },
          index: true, // Index on mainPhone
        },
        workPhone: {
          type: String,
          minlength: [10, "Phone number must be 10 characters long"],
        },
        otherPhone: [
          {
            type: String,
            minlength: [10, "Phone number must be 10 characters long"],
          },
        ],
      },
      email: {
        type: String,
        validate: [
          {
            validator: validator.isEmail,
            message: "Please provide a valid email",
          },
          {
            validator: async function (value) {
              const contact = await this.constructor.findOne({
                email: value,
                churchId: this.churchId,
                _id: { $ne: this._id },
              });
              return !contact;
            },
            message: "Email already exists for another contact in the church",
          },
        ],
        lowercase: true,
        sparse: true,
        trim: true,
      },
      workerStatus: {
        type: Boolean,
        default: false,
      },
      worker: {
        type: String,
        toLowerCase: true,
        default: "Member",
      },
      serviceUnit: {
        type: String,
        trim: true,
      },
      active: {
        type: Boolean,
        default: true,
      },
      educationalLevel: {
        type: String,
        enum: [
          "undefined",
          "primary",
          "secondary",
          "graduate",
          "post-graduate",
        ],
        default: "undefined",
      },
      employmentStatus: {
        type: String,
        enum: [
          "employed",
          "unemployed",
          "self-employed",
          "student",
          "retired",
          "undefined",
        ],
        default: "undefined",
      },
      healthStatus: {
        type: String,
        enum: [
          "healthy",
          "allergic",
          "special condition",
          "others",
          "undefined",
        ],
        default: "undefined",
      },
      healthConditionRemarks: String,
      additonalInfo: {
        type: Object,
        default: {},
      },
    },
    contactType: {
      type: String,
      enum: [
        "member",
        "regular",
        "visitor",
        "participant",
        "inprogress",
        "undefined",
      ],
      default: "inprogress",
      index: true, // Index on contactType
    },
    verification: {
      type: String,
      enum: ["unverified", "incomplete", "verified"],
      default: "unverified",
      index: true, // Index on verification
    },
    contactStatus: {
      type: String,
      enum: ["new", "contacted", "won", "lost"],
      default: "new",
    },
    memberStatus: {
      type: String,
      enum: ["potential", "inprogress", "confirmed", "ex-member"],
      toLowerCase: true,
      default: "confirmed",
    },
    maturityLevel: {
      type: String,
      enum: ["infant", "child", "teen", "adult", "elder", "undefined"],
      default: "undefined",
    },
    action: [
      {
        name: String,
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    assignedTo: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Contact",
      },
    ],
    labels: [
      {
        label: String,
        color: {
          type: String,
          enum: ["blue", "red", "green", "yellow", "purple", "orange", "grey"],
          default: "blue",
        },
      },
    ],
    notes: [
      {
        comment: String,
        date: {
          type: Date,
          default: Date.now(),
        },
        member: {
          type: mongoose.Schema.ObjectId,
          ref: "Contact",
        },
        type: {
          type: String,
          enum: ["general", "prayer", "support", "contact"],
          default: "general",
        },
        isEdited: {
          type: Boolean,
          default: false,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Contact",
    },
    modifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Contact",
    },
    howDidYouHear: String,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // Index on isDeleted
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

// Contact Schema Indexes
// general indexes
contactSchema.index({ churchId: 1 });
contactSchema.index({ orgRole: 1 });
contactSchema.index({ "profile.firstName": 1 });
contactSchema.index({ "profile.lastName": 1 });
contactSchema.index({ "profile.phone.mainPhone": 1 });
contactSchema.index({ "profile.email": 1 });
contactSchema.index({ contactType: 1 });
contactSchema.index({ verification: 1 });
contactSchema.index({ isDeleted: 1 });
// compound indexes

// - A compound text search index on the firstName, lastName, and email fields
contactSchema.index({
  "profile.firstName": "text",
  "profile.lastName": "text",
  "profile.email": "text",
});
// - A compound index on the churchId and contactType fields
contactSchema.index({ churchId: 1, contactType: 1 });
// - A compound index on the id and churchId fields
contactSchema.index({ _id: 1, churchId: 1 });
// - A compound index on the churchId and isDeleted fields
contactSchema.index({ churchId: 1, isDeleted: 1 });
// - A compound index on the churchId and createdAt fields
contactSchema.index({ churchId: 1, createdAt: 1 });

// Check if the userId exists
contactSchema.pre("save", function (next) {
  if (!this.userId) return next();

  User.findById(this.userId).then((user) => {
    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }
    next();
  });
});

// Set suffix based on gender
contactSchema.pre("save", function (next) {
  if (!this.profile.suffix) {
    if (this.profile.gender === "male") {
      this.profile.suffix = "Bro.";
    } else if (this.profile.gender === "female") {
      this.profile.suffix = "Sis.";
    }
  }
  next();
});

contactSchema.post("save", (doc, next) => {
  doc
    .populate("notes.member assignedTo", "profile.firstName profile.lastName")
    .then(() => {
      next();
    });
});

// Populate the orgRole and select only the name
contactSchema.pre(/^find/, function (next) {
  this.populate({ path: "orgRole", select: "name" });
  next();
});

// Virtual Properties for Age
contactSchema.virtual("age").get(function () {
  if (!this.profile.dateOfBirth) return null;
  const currentYear = new Date().getFullYear();
  const dobYear = new Date(this.profile.dateOfBirth).getFullYear();
  return currentYear - dobYear;
});

contactSchema.methods.addNote = function (data) {
  this.notes.push(data);
  return this.save();
};

contactSchema.methods.updateNote = function (noteId, data) {
  const note = this.notes.id(noteId);
  if (!note) {
    return new AppError("Note not found", 404);
  }
  note.date = Date.now();
  note.type = "general";
  note.isEdited = true;
  note.comment = data.note;
  return this.save();
};

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
