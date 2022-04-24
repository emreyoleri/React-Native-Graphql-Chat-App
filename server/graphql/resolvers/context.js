const { AuthenticationError, UserInputError } = require("apollo-server");
const mongoose = require("mongoose");
const {
  validateCreateContextInput,
  validateCreateTwoPersonContextInput,
  validateDeleteContextInput,
  validateLeaveContextInput,
  validateAddUserToContextInput,
  validateKickUserOutContextInput,
  validateMakeAnContextInput,
  validateQuitAdminInput,
  validateChangeContextPhotoInput,
} = require("../../utils/validators");
const Context = require("../../models/Context.js");
const { twoPersonContext } = require("../../models/Context.js");
const User = require("../../models/User.js");
const checkAuth = require("../../utils/checkAuth");

module.exports = {
  Query: {
    getMyContexts: async (_, {}, context) => {
      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const { user } = data;

      const myContextIDs = user.contexts.map((ctx) => ctx._id);

      const myContextsPromises = myContextIDs.map(async ({ _id }) => {
        const _context = await Context.findOne({ _id });

        return _context;
      });

      let contexts;

      await Promise.all(myContextsPromises).then((results) => {
        contexts = [...results];
      });

      const myTwoPersonContextIDs = user.twoPersonContext.map((ctx) => ctx._id);

      const twoPersonContextsPromises = myTwoPersonContextIDs.map(
        async ({ _id }) => {
          const _context = await twoPersonContext.findOne({ _id });

          return _context;
        }
      );

      let twoPersonContexts;

      await Promise.all(twoPersonContextsPromises).then((results) => {
        twoPersonContexts = [...results];
      });

      return { contexts, twoPersonContexts };
    },
  },
  Mutation: {
    createContext: async (
      _,
      { contextInput: { name, users, photoURL } },
      context
    ) => {
      const { errors, valid } = validateCreateContextInput(name, users);
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const admin = data.user;

      let emailsOfContextUsers = [];

      const promises = users
        .filter((user) => user._id !== admin._id.toString())
        .map(async (user) => {
          const { email, _id } = user;
          const currentUser = await User.findOne({ email });
          if (!currentUser)
            throw new UserInputError(
              `No user found matching this email - ${email}.`
            );

          if (!(await User.findOne({ _id })))
            throw new UserInputError(
              `No user found matching this ID - ${_id}.`
            );

          emailsOfContextUsers.push(currentUser.email);
          const { name: userName, email: userEmail, _id: userID } = currentUser;

          return {
            name: userName,
            email: userEmail,
            _id: userID,
            isAdmin: false,
          };
        });

      let usersInfo;

      await Promise.all(promises).then((results) => {
        const _users = [...results];
        _users.unshift({
          name: admin.name,
          email: admin.email,
          _id: admin._id,
          isAdmin: true,
        });

        usersInfo = [..._users];
      });

      if (usersInfo.length < 2)
        throw new UserInputError("Groups cannot be for 1 person.");

      const isImage = (url) => {
        return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
      };

      const contextInfo = {
        name,
        users: usersInfo,
        messages: [],
        createdBy: mongoose.Types.ObjectId(admin._id),
        createdAt: new Date().getTime(),
      };

      let newContext;
      if (!photoURL) {
        newContext = new Context(contextInfo);
      } else if (photoURL && !isImage(photoURL))
        throw new UserInputError(`This url is not in image format.`);
      else {
        newContext = new Context({ ...contextInfo, photoURL });
      }
      const res = await newContext.save();

      [...emailsOfContextUsers, admin.email].forEach(async (email) => {
        await User.findOne({ email }).then((user) => {
          user.contexts.push({
            _id: res._id,
            name: res.name,
          });
          user.save();
        });
      });

      return res;
    },
    createTwoPersonContext: async (_, { userId }, context) => {
      const { errors, valid } = validateCreateTwoPersonContextInput(userId);
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const admin = data.user;

      const user = await User.findOne({ _id: userId });

      if (!user)
        throw new UserInputError(`No user found matching this ID - ${userId}.`);

      if (admin._id.toString() === user._id.toString())
        throw new UserInputError(`No two people in this group can be the same`);

      const findTwoPersonContext = admin.twoPersonContext.find(
        (ctx) => ctx.userID.toString() === user._id.toString()
      );

      if (findTwoPersonContext)
        throw new UserInputError(
          `A context has already been created between these two users.`
        );

      const newContext = new twoPersonContext({
        users: [admin, user],
        messages: [],
      });

      const res = await newContext.save();

      [admin, user].forEach(async ({ _id }) => {
        await User.findOne({ _id }).then((_user) => {
          _user.twoPersonContext.push({
            _id: res._id,
            userID:
              _user._id.toString() === user._id.toString()
                ? admin._id
                : user._id,
          });
          _user.save();
        });
      });

      return res;
    },
    deleteContext: async (_, { deleteContextInput: { _id } }, context) => {
      const { errors, valid } = validateDeleteContextInput(_id);
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const contextToBeDeleted = await Context.findOne({ _id });

      if (!contextToBeDeleted)
        throw new UserInputError(`No context found matching this ID - ${_id}.`);
      const usersInContext = contextToBeDeleted.users;

      const { isAdmin } = contextToBeDeleted.users.find(
        (user) => user._id.toString() === data.user._id.toString()
      );

      if (!isAdmin)
        throw new AuthenticationError("Only group admin can delete groups.");

      usersInContext.forEach(async (user) => {
        const currentUser = await User.findOne({ _id: user._id });

        currentUser.contexts = currentUser.contexts.filter(
          (cxt) => cxt._id.toString() !== _id
        );
        await currentUser.save();
      });

      await contextToBeDeleted.delete();

      return "Context deleted successfully";
    },
    leaveContext: async (_, { leaveContextInput: { _id } }, context) => {
      const { errors, valid } = validateLeaveContextInput(_id);
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const { email } = data.user;

      const user = await User.findOne({ email });

      const contextToLeave = await Context.findOne({ _id });

      const isUserInContext = contextToLeave.users.find(
        (u) => u.email === email
      );
      if (!isUserInContext)
        throw new UserInputError(
          `This user is not already in this group - ${user.email}.`
        );

      if (!contextToLeave)
        throw new UserInputError(`No context found matching this ID - ${_id}.`);

      user.contexts = user.contexts.filter((cxt) => cxt._id.toString() !== _id);
      await user.save();

      contextToLeave.users = contextToLeave.users.filter(
        (currUser) => currUser._id.toString() !== user._id.toString()
      );

      const res = await contextToLeave.save();

      const isAdminLeft = res.users.find((u) => u.isAdmin === true);

      if (res.users.length === 0) {
        await Context.findOneAndDelete({ _id: res._id });
        return `${user.name.toString()} left the group successfully and context deleted.`;
      }

      if (!isAdminLeft) {
        const adminIndex = Math.floor(Math.random() * res.users.length);
        const adminUser = res.users[adminIndex];
        const { email, name } = adminUser;

        await Context.findOneAndUpdate(
          { email },
          {
            users: [
              ...res.users.filter((u) => u.email !== email),
              { ...adminUser._doc, isAdmin: true },
            ],
          }
        );
        return `Admin left the group, new admin: ${name.toUpperCase()}`;
      }

      return `${user.name.toUpperCase()} left the group successfully`;
    },
    addUserToContext: async (
      _,
      { addUserToContextInput: { contextID, userID } },
      context
    ) => {
      const { errors, valid } = validateAddUserToContextInput(
        contextID,
        userID
      );
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const user = await User.findOne({ _id: userID });

      if (!user)
        throw new UserInputError(`No user found matching this ID - ${userID}.`);

      const $context = await Context.findOne({ _id: contextID });

      if (!$context)
        throw new UserInputError(
          `No context found matching this ID - ${contextID}.`
        );

      const isUserAdmin = $context.users.find(
        (u) => u._id.toString() === data.user._id.toString()
      );

      if (!isUserAdmin.isAdmin)
        throw new AuthenticationError("Only group admin can add the user.");

      const isUserInThisContext = user.contexts.find(
        (c) => c._id.toString() === $context._id.toString()
      );

      if (isUserInThisContext)
        throw new UserInputError(
          `${user.name.toUpperCase()} is already registered in this group.`
        );

      user.contexts = [
        ...user.contexts,
        {
          name: $context.name,
          _id: $context._id,
        },
      ];

      await user.save();

      $context.users = [
        ...$context.users,
        {
          name: user.name,
          email: user.email,
          _id: user._id,
          isAdmin: false,
        },
      ];

      await $context.save();

      return `${user.name.toUpperCase()} added to group by ${data.user.name.toUpperCase()}`;
    },
    kickUserOutContext: async (
      _,
      { kickUserOutContextInput: { contextID, userID } },
      context
    ) => {
      const { errors, valid } = validateKickUserOutContextInput(
        contextID,
        userID
      );
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const user = await User.findOne({ _id: userID });

      if (!user)
        throw new UserInputError(`No user found matching this ID - ${userID}.`);

      const $context = await Context.findOne({ _id: contextID });

      if (!$context)
        throw new UserInputError(
          `No context found matching this ID - ${contextID}.`
        );

      const isUserInThisContext = user.contexts.find(
        (c) => c._id.toString() === $context._id.toString()
      );

      if (!isUserInThisContext)
        throw new UserInputError(
          `${user.name.toUpperCase()} is not already registered in this group.`
        );

      const isUserAdmin = $context.users.find(
        (u) => u._id.toString() === data.user._id.toString()
      );

      if (!isUserAdmin.isAdmin)
        throw new AuthenticationError("Only group admin can kick the user.");

      if ($context.createdBy.toString() === userID)
        throw new UserInputError(
          "The user who created the group cannot be removed from the context"
        );

      user.contexts = user.contexts.filter(
        (ctx) => ctx._id.toString() !== contextID
      );

      await user.save();

      $context.users = $context.users.filter(
        (u) => u._id.toString() !== userID
      );

      await $context.save();

      return `${user.name.toUpperCase()} was kicked out of the group by ${data.user.name.toUpperCase()}`;
    },
    makeAnAdmin: async (
      _,
      { makeAnAdminInput: { userID, contextID } },
      context
    ) => {
      const { errors, valid } = validateMakeAnContextInput(contextID, userID);
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const user = await User.findOne({ _id: userID });

      if (!user)
        throw new UserInputError(`No user found matching this ID - ${userID}.`);

      const contextReturn = await Context.findOne({ _id: contextID }).then(
        async ($context) => {
          if (!$context)
            throw new UserInputError(
              `No context found matching this ID - ${contextID}.`
            );

          const isUserInContext = $context.users.find(
            (u) => u._id.toString() === userID
          );

          if (!isUserInContext)
            throw new UserInputError(
              "The user is not included in this context."
            );

          const isUserAdmin = $context.users.find(
            (u) => u._id.toString() === data.user._id.toString()
          );

          if (!isUserAdmin.isAdmin)
            throw new AuthenticationError(
              "Only group admins can remove other admins from admin."
            );

          const userIndex = $context.users.findIndex(
            (u) => u._id.toString() === userID
          );

          const { name, email, _id, isAdmin } = $context.users[userIndex];

          if (isAdmin)
            throw new UserInputError(`User with ID (${_id}) already admin.`);

          $context.users[userIndex] = {
            name,
            email,
            _id,
            isAdmin: true,
          };

          await $context.save();

          return `${user.name.toUpperCase()} declared admin by ${data.user.name.toUpperCase()}`;
        }
      );
      return contextReturn;
    },
    quitAdmin: async (
      _,
      { quitAdminInput: { contextID, userID } },
      context
    ) => {
      const { errors, valid } = validateQuitAdminInput(contextID, userID);
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const user = await User.findOne({ _id: userID });

      if (!user)
        throw new UserInputError(`No user found matching this ID - ${userID}.`);

      const contextReturn = await Context.findOne({ _id: contextID }).then(
        async ($context) => {
          if (!$context)
            throw new UserInputError(
              `No context found matching this ID - ${contextID}.`
            );

          const isUserAdmin = $context.users.find(
            (u) => u._id.toString() === data.user._id.toString()
          );

          if (!isUserAdmin.isAdmin)
            throw new AuthenticationError(
              "Only group admins can make others user."
            );

          const userIndex = $context.users.findIndex(
            (u) => u._id.toString() === userID
          );

          const { name, email, _id, isAdmin } = $context.users[userIndex];
          if (!isAdmin)
            throw new AuthenticationError("User is not already admin.");

          if ($context.createdBy.toString() === userID)
            throw new UserInputError(
              `The user who created the group cannot be removed from the admin.`
            );

          $context.users[userIndex] = {
            name,
            email,
            _id,
            isAdmin: false,
          };

          await $context.save();

          return `${user.name.toUpperCase()} removed from admin by ${data.user.name.toUpperCase()}`;
        }
      );
      return contextReturn;
    },

    changeContextPhoto: async (
      _,
      { changeContextPhotoInput: { contextID, photoURL } },
      context
    ) => {
      const { errors, valid } = validateChangeContextPhotoInput(
        contextID,
        photoURL
      );
      if (!valid) throw new UserInputError("Errors", { errors });

      const data = await checkAuth(context);
      if (data.error) throw new AuthenticationError(data.error);

      const contextReturn = await Context.findOne({ _id: contextID }).then(
        async ($context) => {
          if (!$context)
            throw new UserInputError(
              `No context found matching this ID - ${contextID}.`
            );

          const isUserAdmin = $context.users.find(
            (u) => u._id.toString() === data.user._id.toString()
          );

          if (!isUserAdmin.isAdmin)
            throw new AuthenticationError(
              "Only group admins can change group profile photo."
            );

          const isImage = (url) => {
            return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
          };

          if (!isImage(photoURL))
            throw new UserInputError(`This url is not in image format.`);

          $context.photoURL = photoURL;

          const updatedContext = await $context.save();

          return { ...updatedContext._doc };
        }
      );
      return contextReturn;
    },
  },
};
