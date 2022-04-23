const userResolvers = require("./user.js");
const contextResolvers = require("./context.js");
const messageResolvers = require("./message.js");

module.exports = {
  Query: {
    ...userResolvers.Query,
    ...contextResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...contextResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...userResolvers.Subscription,
    ...messageResolvers.Subscription,
  },
};
