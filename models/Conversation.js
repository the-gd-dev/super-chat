const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conversionSchema = new Schema(
  {
    members: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversionSchema);
