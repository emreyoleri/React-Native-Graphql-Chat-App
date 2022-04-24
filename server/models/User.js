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
  photoURL: {
    type: String,
    default:
      "https://p.kindpng.com/picc/s/105-1055656_account-user-profile-avatar-avatar-user-profile-icon.png",
  },
  contexts: {
    type: [
      {
        name: String,
      },
    ],
    default: [],
  },
  twoPersonContext: {
    type: [
      {
        userID: Schema.Types.ObjectId,
      },
    ],
    default: [],
  },
  token: String,
});

module.exports = model("User", userSchema);
