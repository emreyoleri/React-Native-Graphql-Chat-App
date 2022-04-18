const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  password: String,
  timestamps: Number,
  isOnline: Boolean,
  contexts: {
    type: [
      {
        name: String,
      },
    ],
    default: [],
  },
  token: String,
});

module.exports = model("User", userSchema);
