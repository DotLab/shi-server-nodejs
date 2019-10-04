const User = require('../models/User');
const {apiError, apiSuccess, genPasswordSalt, calcPasswordHash} = require('./utils');

const tokens = {};

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
  const hash = calcPasswordHash(params.password, String(user.passwordSalt));
  if (hash === user.passwordSha256 ) {
    const token = genPasswordSalt();
    tokens[token] = user.userName;
    console.log(tokens);
    return apiSuccess(token);
  }

  return apiError('Invalid combination of email and password');
};
