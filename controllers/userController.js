const User = require('../models/User');
const {apiError, apiSuccess, genSecureRandomString, calcPasswordHash} = require('./utils');
const {createToken, checkUserHasToken} = require('../services/tokenService');
const {FORBIDDEN} = require('./utils');

exports.register = async function(params) {
  const existingUserCount = await User.countDocuments({
    $or: [{userName: params.userName}, {email: params.email}],
  });

  if (existingUserCount > 0) {
    return apiError(FORBIDDEN);
  }

  const salt = genSecureRandomString();
  const hash = calcPasswordHash(params.password, salt);

  await User.create({
    userName: params.userName,
    displayName: params.displayName,
    email: params.email,
    passwordSalt: salt,
    passwordSha256: hash,
  });

  return apiSuccess();
};

exports.login = async function(params) {
  const user = await User.findOne({email: params.email});
  if (!user) {
    return apiError(FORBIDDEN);
  }

  const hash = calcPasswordHash(params.password, user.passwordSalt);
  if (hash !== user.passwordSha256 ) {
    return apiError(FORBIDDEN);
  }
  const token = createToken(user.id);
  return apiSuccess(token);
};
