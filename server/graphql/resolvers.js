const { PubSub } = require("graphql-subscriptions");
const Message = require("../models/Message");
const User = require("../models/User");
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
      });

      const res = await newUser.save();

      return res;
    },
  },
};
