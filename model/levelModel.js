const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const levelSchema = new mongoose.Schema(
  {
    name: {
      // Level name will be unique per church
      type: String,
      required: [true, "Level name is required"],
      index: true,
    },
    ownedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: [true, "Church is required"],
      index: true,
    },
    order: {
      type: Number,
      required: [true, "Level order is required"],
      index: true,
    },
    parentLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
    },
    path: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
levelSchema.index({ name: 1 });
levelSchema.index({ ownedBy: 1, name: 1 }, { unique: true });
levelSchema.index({ ownedBy: 1, order: 1 });
levelSchema.index({ ownedBy: 1, parentLevel: 1 });

// check the order does not pass 10
levelSchema.pre("save", async function (next) {
  if (this.order > 10) {
    return next(new AppError("Order cannot be more than 10", 400));
  }
  next();
});

// generate path for level
levelSchema.pre("save", async function (next) {
  if (this.parentLevel === null || this.parentLevel === undefined) {
    this.path = this.name;
  } else {
    const parentLevel = await this.model("Level").findById(this.parentLevel);
    if (!parentLevel) {
      return next(new AppError("Parent level not found", 404));
    }
    this.path = `${parentLevel.path}/${this.name}`;
  }
});

const Level = mongoose.model("Level", levelSchema);

module.exports = Level;
