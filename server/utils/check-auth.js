const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = async (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.substring(8, authHeader.length - 1);
    if (token && authHeader.startsWith('"Bearer ')) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        if (user) {
          const fullUserInfo = await User.findOne({ email: user.email });
          if (!fullUserInfo.token) {
            new AuthenticationError("User is already logged out!");
            return {
              error: "User is already logged out!",
            };
          }

          return {
            user: { ...fullUserInfo._doc },
          };
        }
      } catch (error) {
        new AuthenticationError("Invalid/Expired token");
        return {
          error: "Invalid/Expired token",
        };
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error("Authorization header must be provided");
};
