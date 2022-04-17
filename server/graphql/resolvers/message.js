const { validateCreateContextInput } = require("../../utils/validators");
const { AuthenticationError, UserInputError } = require("apollo-server");
const Context = require("../../models/Context.js");
const User = require("../../models/User.js");

module.exports = {
  Mutation: {
    createContext: async (_, { contextInput: { name, users } }) => {
      const { errors, valid } = validateCreateContextInput(name, users);
      if (!valid) throw new UserInputError("Errors", { errors });

      let emailsOfContextUsers = [];

      const promises = users.map(async (user, i) => {
        const { email } = user;
        const currentUser = await User.findOne({ email });
        emailsOfContextUsers.push(currentUser.email);
        const { name: userName, email: userEmail, _id: userID } = currentUser;

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

      emailsOfContextUsers.forEach(async (email) => {
        await User.findOne({ email }).then((user) => {
          user.contexts.push({
            _id: res._id,
            name: res.name,
          });
          user.save();
        });
      });

      return res;
    },
  },
};
