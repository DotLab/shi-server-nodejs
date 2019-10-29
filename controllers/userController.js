const User = require('../models/User');
const Poem = require('../models/Poem');
const UserFollowUser = require('../models/UserFollowUser');
const {apiError, apiSuccess, genSecureRandomString, calcPasswordHash} = require('./utils');
const {createToken, getUserId} = require('../services/tokenService');
const {FORBIDDEN, NOT_FOUND, BAD_REQUEST} = require('./utils');

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
    followingCount: 0,
    followerCount: 0,
    lastActiveDate: new Date(),
    viewCount: 0,
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

exports.follow = async function(params) {
  const userId = getUserId(params.token);

  const followingCount = await User.find({_id: params.followId}).count();
  if (followingCount === 0) {
    return apiError(NOT_FOUND);
  }

  // If already following followId
  const existingCount = await UserFollowUser.find({follower: userId, following: params.followId}).count();
  if (existingCount > 0) {
    return apiError(BAD_REQUEST);
  }
  await UserFollowUser.create({
    follower: userId,
    following: params.followId,
  });

  // Increment user's following count.
  await User.findByIdAndUpdate(userId,
      {$inc: {followingCount: 1}});

  // Increment following's follower count
  await User.findByIdAndUpdate(params.followId,
      {$inc: {followerCount: 1}});

  return apiSuccess();
};

exports.unfollow = async function(params) {
  const userId = getUserId(params.token);

  const unfollowCount = await User.find({_id: params.unfollowId}).count();
  if (unfollowCount === 0) {
    return apiError(NOT_FOUND);
  }

  // if not following unfollowId
  const followRelationCount = await UserFollowUser.find({follower: userId, following: params.unfollowId}).count();
  if (followRelationCount === 0) {
    return apiError(FORBIDDEN);
  }
  await UserFollowUser.deleteMany({follower: userId, following: params.unfollowId});

  // Decrement user's following count.
  await User.findByIdAndUpdate(userId,
      {$inc: {followingCount: -1}});

  // Decrement following's follower count
  await User.findByIdAndUpdate(params.unfollowId,
      {$inc: {followerCount: -1}});

  return apiSuccess();
};

exports.updateLastActiveDate = function(userId) {
  User.findByIdAndUpdate(userId, {
    $set: {
      lastActiveDate: new Date(),
    },
  });
};
