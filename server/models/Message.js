const { model, Schema } = require("mongoose");

const messageSchema = new Schema(
  {
    uid: {
      type: String,
      unique: true,
    },
    text: String,
    createdByName: String,
    createdByID: Schema.Types.ObjectId,
    receiverID: Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

module.exports = model("Message", messageSchema);
