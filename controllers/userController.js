const User = require('../models/User');
const {apiError, apiSuccess, genSecureRandomString, calcPasswordHash} = require('./utils');
const {createToken, getUserId, checkTokenValid} = require('../services/tokenService');
const {FORBIDDEN, UNAUTHORIZED} = require('./utils');

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

exports.changePassword = async function(params) {
  const userId = getUserId(params.token);
  const user = await User.findById(userId);
  const hash = calcPasswordHash(params.currentPassword, user.passwordSalt);
  if (hash !== user.passwordSha256) {
    return apiError(FORBIDDEN);
  } else {
    const newSalt = genSecureRandomString();
    const newHash = calcPasswordHash(params.newPassword, newSalt);
    await User.findByIdAndUpdate(user._id, {
      $set: {
        passwordSalt: newSalt,
        passwordSha256: newHash},
    });

    return apiSuccess();
  }
};
