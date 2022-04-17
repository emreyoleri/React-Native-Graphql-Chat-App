const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: Schema.Types.String,
    unique: true,
    lowercase: true,
  },
  email: {
    type: Schema.Types.String,
    unique: true,
    lowercase: true,
  },
  password: Schema.Types.String,
  timestamps: Schema.Types.Number,
  isOnline: Schema.Types.Boolean,
});

module.exports.user = userSchema;
module.exports = model("User", userSchema);
