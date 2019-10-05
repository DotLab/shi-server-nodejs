const tokensToId = {};
const IdToToken = {};

function checkToken(token) {
  return tokensToId[token];
}

function saveToIdToToken(token, id) {
  IdToToken[id] = token;
}


function saveToTokenToId(token, id) {
  tokensToId[token] = id;
}


exports.validateToken = function(token, id) {
  const userId = checkToken(token);
  if (userId === id) {
    return true;
  } else return false;
};


exports.saveToken = function(token, id) {
  saveToIdToToken(token, id);
  saveToTokenToId(token, id);
};

exports.getId = function(token) {
  console.log(tokensToId);
  return tokensToId[token];
};
