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
      createdBy: Schema.Types.ObjectId,
      contextID: Schema.Types.ObjectId,
      timestamps: Number,
      isDeleted: {
        type: Boolean,
        default: false,
      },
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
      createdBy: Schema.Types.ObjectId,
      contextID: Schema.Types.ObjectId,
      timestamps: Number,
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = model("Context", contextSchema);
module.exports.twoPersonContext = model("TwoPersonContext", twoPersonContext);
