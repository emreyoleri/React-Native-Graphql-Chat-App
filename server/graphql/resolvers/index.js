const userResolvers = require("./user.js");
const messageResolvers = require("./message.js");

module.exports = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...userResolvers.Subscription,
  },
};
