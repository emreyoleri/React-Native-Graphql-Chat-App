const { PubSub } = require("graphql-subscriptions");
const { AuthenticationError, UserInputError } = require("apollo-server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const {
  validateRegisterInput,
  validateLoginInput,
  validateChangeUserPhotoInput,
} = require("../../utils/validators");
const checkAuth = require("../../utils/checkAuth");

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
    { expiresIn: 60 * 60 * 24 * 7, algorithm: "HS256" }
  );
  return token;
}

async function login(user) {
  const { _id, email, password } = user;
  const token = generateToken({
    email,
    password,
  });

  const updatedUser = await User.findOneAndUpdate(
    { _id: _id.toString() },
    {
      isOnline: true,
      token,
    },
    { new: true }
  );

  return { ...updatedUser._doc };
}

async function userLoged(user, isOnline = true) {
  const { _id, name, email } = user;
  pubsub.publish("USER_LOGED", {
    userLoged: {
      _id,
      name,
      email,
      isOnline,
    },
  });
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

      const user = await newUser.save();

      userLoged(user);

      getOnlineUserCount();

      return { ...user._doc };
    },
    login: async (_, { loginInput: { email, password } }) => {
      const { errors, valid } = validateLoginInput(email, password);

      if (!valid) throw new UserInputError("Errors", { errors });

      const user = await User.findOne({ email });

      if (!user)
        throw new UserInputError(
          `No user found matching this email - ${email}.`
        );
      const match = await bcrypt.compare(password, user.password);

      if (!match)
        throw new AuthenticationError("Authentication Failed Wrong Password");

      const updatedUser = await login(user);

      getOnlineUserCount();

      userLoged(updatedUser);

      return updatedUser;
    },
    otoLogin: async (_, {}, context) => {
      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      if (data.user) {
        const updatedUser = await login(data.user);
        return updatedUser;
      }
    },

    logout: async (_, {}, context) => {
      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      if (!data.user.token)
        throw new AuthenticationError("User is already logged out!");

      const { email } = data?.user;

      const updatedUser = await User.findOneAndUpdate(
        { email },
        {
          isOnline: false,
          token: null,
        },
        {
          new: true,
        }
      );

      userLoged(updatedUser, false);

      getOnlineUserCount();

      return "Logout Successfully";
    },
    changeUserPhoto: async (
      _,
      { changeUserPhotoInput: { photoURL } },
      context
    ) => {
      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const { errors, valid } = validateChangeUserPhotoInput(photoURL);
      if (!valid) throw new UserInputError("Errors", { errors });

      // !

      const updatedUser = await User.findOneAndUpdate(
        { _id: data.user._id },
        { photoURL },
        { new: true }
      );

      return { ...updatedUser._doc };
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
