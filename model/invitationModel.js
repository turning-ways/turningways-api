const mongoose = require("mongoose");
const crypto = require("crypto");

const invitationSchema = new mongoose.Schema({
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contact",
    required: true,
  },
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Church",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contact",
    required: true,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  acceptedAt: {
    type: Date,
    validate: {
      validator: function (v) {
        return this.accepted || !v;
      },
      message: "Accepted date is only allowed if invitation is accepted",
    },
  },
});

// Generate a token for the invitation when a new invitation is created
invitationSchema.statics.generateToken = function () {
  return crypto.randomBytes(16).toString("hex");
};

const Invitation = mongoose.model("Invitation", invitationSchema);

module.exports = Invitation;
