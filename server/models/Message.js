const { model, Schema } = require("mongoose");

const messageSchema = new Schema({
  text: Schema.Types.String,
  createdByName: Schema.Types.String,
  createdByID: Schema.Types.ObjectId,
  receiverID: Schema.Types.ObjectId,
  timestamps: Schema.Types.Number,
});
module.exports.message = messageSchema;
module.exports = model("Message", messageSchema);
