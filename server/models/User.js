const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    uid: {
      type: String,
      unique: true,
    },
    name: String,
    email: String,
    password: String,
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
