const { model, Schema } = require("mongoose");

const contextSchema = new Schema({
  name: String,
  photoURL: {
    type: String,
    default:
      "https://www.iconbunny.com/icons/media/catalog/product/cache/2/thumbnail/600x/1b89f2fc96fc819c2a7e15c7e545e8a9/1/5/1543.1-clients-icon-iconbunny.jpg",
  },
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
