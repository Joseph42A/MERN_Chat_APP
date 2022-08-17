const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId, // should be mongodb ID
      ref: "User",
      required: true,
    },
    media: String,
    view: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
