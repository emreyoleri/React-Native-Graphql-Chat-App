const { model, Schema } = require("mongoose");
const { user } = require("./User.js");
const { message } = require("./Message.js");

const contextSchema = new Schema({
  users: [user],
  messages: [message],
});

module.exports = model("Context", contextSchema);
