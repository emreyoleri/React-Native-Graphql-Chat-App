const { PubSub } = require("graphql-subscriptions");
const { AuthenticationError, UserInputError } = require("apollo-server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");
const checkAuth = require("../../utils/check-auth");

const SECRET_KEY = process.env.SECRET_KEY;
const pubsub = new PubSub();

async function getOnlineUserCount() {
  const onlineUsers = (await User.find({ isOnline: true })).length;

  pubsub.publish("GET_ONLINE_USER_COUNT", {
    getOnlineUserCount: onlineUsers,
  });
}

function generateToken({ email, password }) {
  const token = jwt.sign(
    {
      email,
      password,
    },
    SECRET_KEY,
    { expiresIn: 60 * 60, algorithm: "HS256" }
  );
  return token;
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

      const hashedPassword = await bcrypt.hash(password, 12);

      const token = generateToken({
        email,
        password: hashedPassword,
      });

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        timestamps: new Date().getTime(),
        isOnline: true,
        token,
      });

      const res = await newUser.save();

      const { _id } = res;
      pubsub.publish("USER_LOGED", {
        userLoged: {
          _id,
          name,
          email,
          isOnline: true,
        },
      });

      getOnlineUserCount();

      return { ...res._doc };
    },
    login: async (_, { loginInput: { email, password } }) => {
      const { errors, valid } = validateLoginInput(email, password);

      if (!valid) throw new UserInputError("Errors", { errors });

      const user = await User.findOne({ email });

      if (!user) throw new AuthenticationError("User Not Found");

      const match = await bcrypt.compare(password, user.password);

      if (!match)
        throw new AuthenticationError("Authentication Failed Wrong Password");

      const { _id, name, timestamps } = user;
      const token = generateToken({
        email,
        password: user.password,
      });

      const updatedUser = await User.findOneAndUpdate(
        { _id: _id.toString() },
        {
          password: user.password,
          isOnline: true,
          token,
        },
        { new: true }
      );

      pubsub.publish("USER_LOGED", {
        userLoged: {
          _id,
          name,
          email,
          isOnline: true,
        },
      });

      getOnlineUserCount();

      return { ...updatedUser._doc };
    },
    logout: async (_, {}, context) => {
      const data = await checkAuth(context);
      if (data.error) {
        throw new AuthenticationError(data.error);
      }

      const { email } = data?.user;

      const { _id, name } = await User.findOneAndUpdate(
        { email },
        {
          isOnline: false,
          token: null,
        }
      );

      pubsub.publish("USER_LOGED", {
        userLoged: {
          _id,
          name,
          email,
          isOnline: false,
        },
      });

      getOnlineUserCount();

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
