const { validateCreateContextInput } = require("../../utils/validators");
const { AuthenticationError, UserInputError } = require("apollo-server");
const { PubSub, withFilter } = require("graphql-subscriptions");
const jwt = require("jsonwebtoken");
const Context = require("../../models/Context.js");
const { twoPersonContext } = require("../../models/Context.js");
const User = require("../../models/User.js");
const Message = require("../../models/Message.js");
const checkAuth = require("../../utils/checkAuth");

const pubsub = new PubSub();
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = {
  Mutation: {
    sendMessage: async (
      _,
      { sendMessageInput: { contextID, text } },
      context
    ) => {
      if (!contextID || !text)
        throw new UserInputError(`"contextID" and "text" are required.`);
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
        createdByID: user.id,
        contextID: thisContext._id,
        timestamps: new Date().getTime(),
      });

      const res = await newMessage.save();

      const { _id, timestamps, isDeleted } = res;

      const message = {
        text,
        contextID,
        timestamps,
        _id,
        isDeleted,
      };

      thisContext.messages.push(message);

      thisContext.save();

      pubsub.publish("NEW_MESSAGE", {
        newMessage: message,
      });

      return message;
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("NEW_MESSAGE"),
        async (payload, variables) => {
          // ! TODO: SEND NOTIFICATION

          const { contextID, token } = variables.newMessageInput;

          let userDoc;

          const errors = {};

          try {
            const user = jwt.verify(token, SECRET_KEY);
            if (user) {
              const fullUserInfo = await User.findOne({ email: user.email });

              userDoc = { ...fullUserInfo._doc };
            }
          } catch (error) {
            errors.token = "Invalid/Expired token";
          }

          if (errors.token) {
            console.error("errors:", errors);
            return false;
          }

          const userInThisContext = userDoc.contexts.find(
            (ctx) => ctx._id.toString() === contextID
          );
          const userInThisTwoPersonContext = userDoc.twoPersonContext.find(
            (ctx) => ctx._id.toString() === contextID
          );

          if (!userInThisContext && !userInThisTwoPersonContext) {
            errors.context = `No context found matching this ID - ${contextID}.`;
            console.error(errors);
            return false;
          }

          return true;
        }
      ),
    },
  },
};
