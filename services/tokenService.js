const tokensToId = {};
const IdToToken = {};

const {genSecureRandomString} = require('../controllers/utils');


function checkToken(token) {
  return tokensToId[token];
}


function saveToken(token, id) {
  IdToToken[id] = token;
  tokensToId[token] = id;
}


exports.createToken = function(userId) {
  const token = genSecureRandomString();
  saveToken(token, userId);
  return token;
};


exports.checkTokenValid = function(token) {
  const userId = checkToken(token);
  if (!userId) {
    return false;
  } else return true;
};


exports.getUserId = function(token) {
  return tokensToId[token];
};


exports.checkLoggedIn = function(userId) {
  const token = IdToToken[userId];
  if (!token) return false;
  else return true;
};
