const userResolvers = require("./user.js");
const contextResolver = require("./context.js");

module.exports = {
  Query: {
    ...userResolvers.Query,
    ...contextResolver.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...contextResolver.Mutation,
  },
  Subscription: {
    ...userResolvers.Subscription,
  },
};
