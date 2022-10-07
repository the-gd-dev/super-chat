const { Schema, model } = require("mongoose");
const ChangePasswordRequestSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  token: {
    required: true,
    type: String,
  },
  expiresIn: {
    required: true,
    type: String,
  },
});

module.exports = model("ChangePasswordRequest", ChangePasswordRequestSchema);

