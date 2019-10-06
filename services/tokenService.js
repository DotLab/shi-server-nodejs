const {genSecureRandomString} = require('../controllers/utils');

const userIdByToken = {};
const tokenByUserId = {};

exports.createToken = function(userId) {
  if (tokenByUserId[userId] !== undefined) {
    delete userIdByToken[tokenByUserId[userId]];
    delete tokenByUserId[userId];
  }

  const token = genSecureRandomString();
  tokenByUserId[userId] = token;
  userIdByToken[token] = userId;

  return token;
};


exports.checkTokenValid = function(token) {
  const userId = userIdByToken[token];
  if (!userId) {
    return false;
  }
  return true;
};


exports.getUserId = function(token) {
  return userIdByToken[token];
};


exports.checkUserHasToken = function(userId) {
  const token = tokenByUserId[userId];
  if (!token) {
    return false;
  }
  return true;
};

