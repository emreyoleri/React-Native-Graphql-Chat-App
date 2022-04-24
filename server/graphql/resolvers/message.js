const { AuthenticationError, UserInputError } = require("apollo-server");
const { PubSub, withFilter } = require("graphql-subscriptions");
const jwt = require("jsonwebtoken");
const Context = require("../../models/Context.js");
const { twoPersonContext } = require("../../models/Context.js");
const User = require("../../models/User.js");
const Message = require("../../models/Message.js");
const checkAuth = require("../../utils/checkAuth");
const {
  validateSendMessageInput,
  validateDeleteMessageInput,
} = require("../../utils/validators");

const pubsub = new PubSub();

module.exports = {
  Mutation: {
    sendMessage: async (
      _,
      { sendMessageInput: { contextID, text } },
      context
    ) => {
      const { errors, valid } = validateSendMessageInput(contextID, text);
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const { user } = data;

      const contextCheck = await Context.findOne({ _id: contextID });
      const twoPersonContextCheck = await twoPersonContext.findOne({
        _id: contextID,
      });

      const thisContext = contextCheck || twoPersonContextCheck;

      if (!contextCheck && !twoPersonContextCheck)
        throw new UserInputError(
          `No context found matching this ID - ${contextID}.`
        );

      const isUserInThisContext = thisContext.users.find(
        (u) => u._id.toString() === user._id.toString()
      );

      if (!isUserInThisContext)
        throw new UserInputError(`User is not in this group. - ${user._id}`);

      const newMessage = new Message({
        text,
        createdBy: user._id,
        contextID: thisContext._id,
        timestamps: new Date().getTime(),
      });

      const res = await newMessage.save();

      const { _id, timestamps, isDeleted, createdBy } = res;

      const message = {
        _id,
        text,
        contextID,
        timestamps,
        createdBy,
        isDeleted,
      };

      thisContext.messages.push(message);

      thisContext.save();

      pubsub.publish("NEW_MESSAGE", {
        newMessage: message,
      });

      return message;
    },
    deleteMessage: async (
      _,
      { deleteMessageInput: { contextID, messageID } },
      context
    ) => {
      const { errors, valid } = validateDeleteMessageInput(
        contextID,
        messageID
      );
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const { user } = data;

      const contextCheck = await Context.findOne({ _id: contextID });
      const twoPersonContextCheck = await twoPersonContext.findOne({
        _id: contextID,
      });

      const thisContext = contextCheck || twoPersonContextCheck;

      if (!contextCheck && !twoPersonContextCheck)
        throw new UserInputError(
          `No context found matching this ID - ${contextID}.`
        );

      const isUserInThisContext = thisContext.users.find(
        (u) => u._id.toString() === user._id.toString()
      );

      if (!isUserInThisContext)
        throw new UserInputError(`User is not in this group. - ${user._id}`);

      const message = await Message.findOne({ _id: messageID });

      if (!message)
        throw new UserInputError(
          `No message found matching this ID - ${messageID}.`
        );

      if (message.createdBy.toString() !== user._id.toString())
        throw new AuthenticationError(
          "Only the user who sent the message can delete the message."
        );

      message.isDeleted = true;

      const res = await message.save();

      const messageDeleted = {
        _id: res._id,
        text: res.text,
        contextID: res.contextID,
        timestamps: res.timestamps,
        createdBy: res.createdBy,
        isDeleted: res.isDeleted,
      };

      pubsub.publish("MESSAGE_DELETED", {
        messageDeleted: messageDeleted,
      });

      const { messages } = thisContext;

      const messageIndex = messages.findIndex(
        (msg) => msg._id.toString() === messageID
      );

      const { createdBy, text, _id, isDeleted, ContextID, timestamps } =
        messages[messageIndex];

      if (isDeleted)
        throw new UserInputError(`This message has already been deleted`);

      messages[messageIndex] = {
        _id,
        text,
        createdBy,
        ContextID,
        timestamps,
        isDeleted: true,
      };

      await thisContext.save();

      return "Message deleted successfully.";
    },
  },
  Subscription: {
    newMessage: {
      subscribe: () => pubsub.asyncIterator("NEW_MESSAGE"),
    },
    messageDeleted: {
      subscribe: () => pubsub.asyncIterator("MESSAGE_DELETED"),
    },
  },
};
