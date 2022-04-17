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
});

module.exports = model("Context", contextSchema);
