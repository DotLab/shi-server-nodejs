const User = require('../models/User');
const {apiError, apiSuccess, genPasswordSalt, calcPasswordHash} = require('./utils');
const {createToken, checkLoggedIn, getUserId} = require('../services/tokenService');

exports.register = async function(params) {
  const existingUserCount = await User.countDocuments({
    $or: [{userName: params.userName}, {email: params.email}],
  });

  if (existingUserCount > 0) {
    return apiError('Existing name or email');
  }

  const salt = genPasswordSalt();
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
    return apiError('Invalid email');
  }
  // if user is logged in, reject login
  if (checkLoggedIn(user.id)) {
    return apiError('Already logged in');
  }

  const hash = calcPasswordHash(params.password, user.passwordSalt);
  if (hash !== user.passwordSha256 ) {
    return apiError('Fail');
  } else {
    const token = createToken(user.id);
    return apiSuccess(token);
  }
};


exports.changePassword = async function(params) {
  const userId = getUserId(params.token);

  if (!userId) {
    return apiError('Not logged in');
  }
  const user = await User.findById(userId);
  if (!user) {
    return apiError('Not registered');
  }

  const hash = calcPasswordHash(params.currentPassword, user.passwordSalt);

  if (hash !== user.passwordSha256) {
    return apiError('Forbidden');
  } else {
    const newSalt = genPasswordSalt();
    const newHash = calcPasswordHash(params.newPassword, newSalt);
    User.findByIdAndUpdate(user.id, {passwordSalt: newSalt, passwordSha256: newHash}, {});

    return apiSuccess();
  }
};
