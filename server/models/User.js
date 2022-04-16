const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: Schema.Types.String,
    unique: true,
  },
  email: {
    type: Schema.Types.String,
    unique: true,
  },
  password: Schema.Types.String,
  timestamps: Schema.Types.Number,
});

module.exports = model("User", userSchema);
