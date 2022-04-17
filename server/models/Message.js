const { model, Schema } = require("mongoose");

const messageSchema = new Schema({
  text: String,
  createdByName: String,
  createdByID: Schema.Types.ObjectId,
  receiverID: Schema.Types.ObjectId,
  timestamps: Number,
});

module.exports = model("Message", messageSchema);
