const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    uid: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: String,
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
