const User = require('../models/User');
const {apiError, apiSuccess, genPasswordSalt, calcPasswordHash} = require('./utils');

exports.register = async function(params) {
  const existingUser = await User.findOne({
    $or: [{userName: params.userName}, {email: params.email}],
  });

  if (existingUser) {
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
