const { validateCreateContextInput } = require("../../utils/validators");
const { AuthenticationError, UserInputError } = require("apollo-server");
const Context = require("../../models/Context.js");
const User = require("../../models/User.js");
const checkAuth = require("../../utils/checkAuth");

module.exports = {
  Mutation: {
    createContext: async (_, { contextInput: { name, users } }, context) => {
      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const admin = data.user;

      const { errors, valid } = validateCreateContextInput(name, users);
      if (!valid) throw new UserInputError("Errors", { errors });

      let emailsOfContextUsers = [];

      const promises = users
        .filter((user) => user._id !== admin._id.toString())
        .map(async (user) => {
          const { email, _id } = user;
          const currentUser = await User.findOne({ email });
          if (!currentUser)
            throw new UserInputError(
              `No user found matching this email - ${email}.`
            );

          if (!(await User.findOne({ _id })))
            throw new UserInputError(
              `No user found matching this ID - ${_id}.`
            );

          emailsOfContextUsers.push(currentUser.email);
          const { name: userName, email: userEmail, _id: userID } = currentUser;

          return {
            name: userName,
            email: userEmail,
            _id: userID,
            isAdmin: false,
          };
        });

      let usersInfo;

      await Promise.all(promises).then((results) => {
        usersInfo = [
          ...results,
          {
            name: admin.name,
            email: admin.email,
            _id: admin._id,
            isAdmin: true,
          },
        ];
      });

      if (usersInfo.length < 2)
        throw new UserInputError("Groups cannot be for 1 person.");

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
