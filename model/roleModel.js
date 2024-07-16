const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Role name is required"],
    unique: true,
  },
  church: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Church",
    required: [true, "Church is required"],
  },
  description: {
    type: String,
    required: [true, "Role description is required"],
  },
  permissions: {
    type: [String],
    required: [true, "Role permissions are required"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
