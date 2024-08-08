const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      index: true,
    },
    church: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: [true, "Church is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Role description is required"],
    },
    permissions: {
      type: [String],
      required: [true, "Role permissions are required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

roleSchema.index({ name: 1, church: 1 }, { unique: true });
roleSchema.index({ church: 1 });
roleSchema.index({ _id: 1, church: 1 }); // Index on _id and church for faster lookup of roles
roleSchema.index({ permissions: 1 }); // Index on permissions for faster lookup of roles by permission

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
