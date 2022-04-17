const { validateCreateContextInput } = require("../../utils/validators");
const { AuthenticationError, UserInputError } = require("apollo-server");
const Context = require("../../models/Context.js");
const User = require("../../models/User.js");

module.exports = {
  Mutation: {
    createContext: async (_, { contextInput: { name, users } }) => {
      const { errors, valid } = validateCreateContextInput(name, users);
      if (!valid) throw new UserInputError("Errors", { errors });

      const promises = users.map(async (user, i) => {
        const { email } = users[i];
        const {
          name: userName,
          email: userEmail,
          _id: userID,
        } = await User.findOne({ email });

        return {
          name: userName,
          email: userEmail,
          _id: userID,
        };
      });

      let usersInfo;

      await Promise.all(promises).then((results) => (usersInfo = results));

      const newContext = new Context({
        name,
        users: usersInfo,
        messages: [],
      });

      const res = await newContext.save();

      return res;
    },
  },
};
