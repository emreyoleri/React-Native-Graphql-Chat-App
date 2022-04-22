const { model, Schema } = require("mongoose");

const messageSchema = new Schema({
  text: String,
  createdByID: Schema.Types.ObjectId,
  contextID: Schema.Types.ObjectId,
  timestamps: Number,
});

module.exports = model("Message", messageSchema);
