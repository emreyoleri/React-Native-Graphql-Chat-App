const mongoose = require("mongoose");

module.exports.validateRegisterInput = (name, email, password) => {
  const errors = {};
  if (name.trim() === "") errors.name = "Name must not be empty";

  if (email.trim() === "") errors.email = "Email must not be empty";
  else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx))
      errors.email = "Email must be a valid email address";
  }
  if (password === "") errors.password = "Password must not empty";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (email, password) => {
  const errors = {};
  if (email.trim() === "") errors.email = "Email must not be empty";

  const regEx =
    /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
  if (!email.match(regEx)) errors.email = "Email must be a valid email address";

  if (password.trim() === "") errors.password = "Password must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateCreateContextInput = (name, users) => {
  const errors = {};
  if (name.trim() === "") errors.name = "Name must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateChangeUserPhotoInput = (photoURL) => {
  const errors = {};

  if (photoURL.trim() === "") errors.photoURL = "Photo URL must not be empty";

  const isImage = (url) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  };

  if (!isImage(photoURL)) errors.typePhotoURL = "Photo URL must image format";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateSendMessageInput = (contextID, text) => {
  const errors = {};

  if (contextID.trim() === "")
    errors.contextID = "Context ID must not be empty";
  if (text.trim() === "") errors.text = "Text must not be empty";

  if (!mongoose.isValidObjectId(contextID))
    errors.invalidContextID = "Context Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateDeleteMessageInput = (contextID, messageID) => {
  const errors = {};

  if (contextID.trim() === "")
    errors.contextID = "Context ID must not be empty";
  if (messageID.trim() === "")
    errors.messageID = "Message ID must not be empty";

  if (!mongoose.isValidObjectId(contextID))
    errors.invalidContextID = "Context Id's type is not ObjectId";

  if (!mongoose.isValidObjectId(messageID))
    errors.invalidMessageID = "Message Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateCreateTwoPersonContextInput = (userId) => {
  const errors = {};

  if (userId.trim() === "") errors.userId = "User Id must not be empty";

  if (!mongoose.isValidObjectId(userId))
    errors.invalidUserId = "User Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateDeleteContextInput = (_id) => {
  const errors = {};

  if (_id.trim() === "") errors._id = "Id must not be empty";

  if (!mongoose.isValidObjectId(_id))
    errors.invalidId = "Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLeaveContextInput = (_id) => {
  const errors = {};

  if (_id.trim() === "") errors._id = "Id must not be empty";

  if (!mongoose.isValidObjectId(_id))
    errors.invalidId = "Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateAddUserToContextInput = (contextID, userID) => {
  const errors = {};

  if (contextID.trim() === "")
    errors.contextID = "Context ID must not be empty";
  if (userID.trim() === "") errors.userID = "User ID must not be empty";

  if (!mongoose.isValidObjectId(contextID))
    errors.invalidContextId = "Context Id's type is not ObjectId";

  if (!mongoose.isValidObjectId(userID))
    errors.invalidUserId = "User Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateKickUserOutContextInput = (contextID, userID) => {
  const errors = {};

  if (contextID.trim() === "")
    errors.contextID = "Context ID must not be empty";
  if (userID.trim() === "") errors.userID = "User ID must not be empty";

  if (!mongoose.isValidObjectId(contextID))
    errors.invalidContextId = "Context Id's type is not ObjectId";

  if (!mongoose.isValidObjectId(userID))
    errors.invalidUserId = "User Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateQuitAdminInput = (contextID, userID) => {
  const errors = {};

  if (contextID.trim() === "")
    errors.contextID = "Context ID must not be empty";
  if (userID.trim() === "") errors.userID = "User ID must not be empty";

  if (!mongoose.isValidObjectId(contextID))
    errors.invalidContextId = "Context Id's type is not ObjectId";

  if (!mongoose.isValidObjectId(userID))
    errors.invalidUserId = "User Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateMakeAnContextInput = (contextID, userID) => {
  const errors = {};

  if (contextID.trim() === "")
    errors.contextID = "Context ID must not be empty";
  if (userID.trim() === "") errors.userID = "User ID must not be empty";

  if (!mongoose.isValidObjectId(contextID))
    errors.invalidContextId = "Context Id's type is not ObjectId";

  if (!mongoose.isValidObjectId(userID))
    errors.invalidUserId = "User Id's type is not ObjectId";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateChangeContextPhotoInput = (contextID, photoURL) => {
  const errors = {};

  if (contextID.trim() === "")
    errors.contextID = "Context ID must not be empty";
  if (photoURL.trim() === "") errors.photoURL = "Photo URL must not be empty";

  if (!mongoose.isValidObjectId(contextID))
    errors.invalidContextId = "Context Id's type is not ObjectId";

  const isImage = (url) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  };

  if (!isImage(photoURL)) errors.typePhotoURL = "Photo URL must image format";

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
