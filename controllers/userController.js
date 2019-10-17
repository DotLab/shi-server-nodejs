const User = require('../models/User');
const UserFollowUser = require('../models/UserFollowUser');
const {apiError, apiSuccess, genSecureRandomString, calcPasswordHash} = require('./utils');
const {createToken, getUserId} = require('../services/tokenService');
const {FORBIDDEN, NOT_FOUND} = require('./utils');

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
    lastActive: new Date(),
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
  const user = await User.findById(userId);

  const following = await User.findById(params.followId);
  if (!following) {
    return apiError(NOT_FOUND);
  }

  // If already following followId
  const existing = await UserFollowUser.find({follower: userId, following: params.followId});
  if (existing.length) {
    return apiError(FORBIDDEN);
  }
  await UserFollowUser.create({
    follower: user,
    following: following,
  });

  // user's following count ++, following's follower count ++, create follow relation
  const newFollowingCount = user.followingCount + 1;
  await User.findByIdAndUpdate(userId, {followingCount: newFollowingCount});

  const newFollowerCount = following.followerCount + 1;
  await User.findByIdAndUpdate(params.followId, {followerCount: newFollowerCount});

  return apiSuccess();
};

exports.unfollow = async function(params) {
  const userId = getUserId(params.token);
  const user = await User.findById(userId);

  const unfollow = await User.findById(params.unfollowId);
  if (!unfollow) {
    return apiError(NOT_FOUND);
  }

  // if not following unfollowId
  const followRelation = await UserFollowUser.findOne({follower: user, following: unfollow});
  if (!followRelation) {
    return apiError(FORBIDDEN);
  }
  await UserFollowUser.findByIdAndRemove(followRelation.id);

  // user's following count --, unfollow's follower count --, remove userFollowUser relation
  const newFollowingCount = user.followingCount - 1;
  await User.findByIdAndUpdate(userId, {followingCount: newFollowingCount});

  const newFollowerCount = unfollow.followerCount - 1;
  await User.findByIdAndUpdate(params.unfollowId, {followerCount: newFollowerCount});

  return apiSuccess();
};
