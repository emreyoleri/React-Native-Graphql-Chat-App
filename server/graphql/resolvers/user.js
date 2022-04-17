const { PubSub } = require("graphql-subscriptions");
const { AuthenticationError, UserInputError } = require("apollo-server");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");

const pubsub = new PubSub();

async function generateToken(user) {
  const idToken = await bcrypt.hash(user.id, 12);
  const emailToken = await bcrypt.hash(user.email, 12);
  const passwordToken = await bcrypt.hash(user.password, 12);
  return idToken + emailToken + passwordToken;
}

module.exports = {
  Query: {
    getUsers: async () => {
      const users = await User.find().sort("timestamps");
      return users;
    },
  },
  Mutation: {
    register: async (_, { registerInput: { name, email, password } }) => {
      const { valid, errors } = validateRegisterInput(name, email, password);
      if (!valid) throw new UserInputError("Errors", { errors });

      const newPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        name,
        email,
        password: newPassword,
        timestamps: new Date().getTime(),
        isOnline: true,
      });

      const res = await newUser.save();
      const token = generateToken(res);

      const { _id, timestamps } = res;
      pubsub.publish("USER_LOGED", {
        userLoged: {
          _id,
          name,
          email,
          password: newPassword,
          timestamps,
          isOnline: true,
          token,
        },
      });

      const onlineUsers = (await User.find({ isOnline: true })).length;

      pubsub.publish("GET_ONLINE_USER_COUNT", {
        getOnlineUserCount: onlineUsers,
      });

      return { ...res._doc, token };
    },
    login: async (_, { loginInput: { email, password } }) => {
      const { errors, valid } = validateLoginInput(email, password);

      if (!valid) throw new UserInputError("Errors", { errors });

      const user = await User.findOne({ email });

      if (!user) throw new AuthenticationError("User Not Found");

      const match = await bcrypt.compare(password, user.password);

      if (!match)
        throw new AuthenticationError("Authentication Failed Wrong Password");

      if (user.isOnline) return user;
      const { _id, name, timestamps } = user;

      const updatedUser = await User.findOneAndUpdate(
        { _id: _id.toString() },
        {
          name,
          email,
          password: user.password,
          timestamps,
          isOnline: true,
        },
        { new: true }
      );
      const token = generateToken(updatedUser);

      pubsub.publish("USER_LOGED", {
        userLoged: {
          _id,
          name,
          email,
          password,
          timestamps,
          isOnline: true,
          token,
        },
      });

      const onlineUsers = (await User.find({ isOnline: true })).length;

      pubsub.publish("GET_ONLINE_USER_COUNT", {
        getOnlineUserCount: onlineUsers,
      });

      return { ...updatedUser._doc, token };
    },
    logout: async (_, { logoutInput: { email, password } }) => {
      const user = await User.findOne({ email });

      const match = await bcrypt.compare(password, user.password);

      if (!match)
        throw new AuthenticationError("Authentication Failed Wrong Password");

      if (!user.isOnline) return "Logout Successfully";

      const { _id, name, timestamps } = user;

      const updatedUser = await User.findOneAndUpdate(
        { _id: _id.toString() },
        {
          _id,
          name,
          email,
          password: user.password,
          timestamps,
          isOnline: false,
        },
        { new: true }
      );

      const token = generateToken(updatedUser);

      pubsub.publish("USER_LOGED", {
        userLoged: {
          _id,
          name,
          email,
          password,
          timestamps,
          isOnline: false,
          token,
        },
      });

      const onlineUsers = (await User.find({ isOnline: true })).length;

      pubsub.publish("GET_ONLINE_USER_COUNT", {
        getOnlineUserCount: onlineUsers,
      });

      return "Logout Successfully";
    },
  },
  Subscription: {
    userLoged: {
      subscribe: () => pubsub.asyncIterator("USER_LOGED"),
    },
    getOnlineUserCount: {
      subscribe: () => pubsub.asyncIterator("GET_ONLINE_USER_COUNT"),
    },
  },
};
