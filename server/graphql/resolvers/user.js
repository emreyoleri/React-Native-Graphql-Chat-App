const { PubSub } = require("graphql-subscriptions");
const { AuthenticationError, UserInputError } = require("apollo-server");
const Message = require("../../models/Message");
const User = require("../../models/User");
const mongoose = require("mongoose");
const pubsub = new PubSub();

module.exports = {
  Query: {
    getUsers: async () => {
      const users = await User.find().sort("timestamps");
      return users;
    },
  },
  Mutation: {
    register: async (_, { registerInput: { name, email, password } }) => {
      const newUser = new User({
        name,
        email,
        password,
        timestamps: new Date().getTime(),
        isOnline: true,
      });

      const res = await newUser.save();

      return res;
    },
    login: async (_, { loginInput: { email, password } }) => {
      // Todo:  the password will hash with jwt
      const user = await User.findOne({ email });

      if (user) {
        if (user.password === password) {
          if (user.isOnline) return user;
          const { _id, name, email, password, timestamps } = user;
          pubsub.publish("USER_LOGED", {
            userLoged: {
              _id,
              name,
              email,
              password,
              timestamps,
              isOnline: true,
            },
          });

          const updatedUser = await User.findOneAndUpdate(
            { _id: _id.toString() },
            {
              name,
              email,
              password,
              timestamps,
              isOnline: true,
            },
            { new: true }
          );

          const onlineUsers = await (
            await User.find({ isOnline: true })
          ).length;

          pubsub.publish("GET_ONLINE_USER_COUNT", {
            getOnlineUserCount: onlineUsers,
          });

          return updatedUser;
        } else {
          throw new AuthenticationError("Authentication Failed Wrong Password");
        }
      } else {
        throw new AuthenticationError("User Not Found");
      }
    },
    logout: async (_, { logoutInput: { email, password } }) => {
      const user = await User.findOne({ email });

      if (user && user.password === password) {
        if (!user.isOnline) return "Logout Successfully";
        const { _id, name, email, password, timestamps } = user;
        pubsub.publish("USER_LOGED", {
          userLoged: {
            _id,
            name,
            email,
            password,
            timestamps,
            isOnline: false,
          },
        });
        const updatedUser = await User.findOneAndUpdate(
          { _id: _id.toString() },
          {
            name,
            email,
            password,
            timestamps,
            isOnline: false,
          },
          { new: true }
        );

        const onlineUsers = await (await User.find({ isOnline: true })).length;

        pubsub.publish("GET_ONLINE_USER_COUNT", {
          getOnlineUserCount: onlineUsers,
        });

        return "Logout Successfully";
      } else {
        new AuthenticationError("Logout Failed");
      }
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
