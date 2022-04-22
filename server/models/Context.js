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

const twoPersonContext = new Schema({
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
      createdByID: Schema.Types.ObjectId,
      contextID: Schema.Types.ObjectId,
      timestamps: Number,
    },
  ],
});

module.exports = model("Context", contextSchema);
module.exports.twoPersonContext = model("TwoPersonContext", twoPersonContext);
