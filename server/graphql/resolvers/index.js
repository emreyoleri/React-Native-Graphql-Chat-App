const userResolvers = require("./user.js");

module.exports = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
  Subscription: {
    ...userResolvers.Subscription,
  },
};
