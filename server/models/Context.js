const { model, Schema } = require("mongoose");

const contextSchema = new Schema({
  name: String,
  users: [
    {
      name: {
        type: String,
        lowercase: true,
      },
      email: {
        type: String,
        lowercase: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
  ],
  messages: [
    {
      text: String,
      createdByName: String,
      createdByID: Schema.Types.ObjectId,
      receiverID: Schema.Types.ObjectId,
      timestamps: Number,
    },
  ],
  createdAt: Number,
  createdBy: Schema.Types.ObjectId,
});

module.exports = model("Context", contextSchema);
