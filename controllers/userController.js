const User = require('../models/User');
const UserFollowUser = require('../models/UserFollowUser');

const {apiError, apiSuccess, genSecureRandomString, calcPasswordHash} = require('./utils');
const {createToken, checkUserHasToken, getUserId} = require('../services/tokenService');

exports.register = async function(params) {
  const existingUserCount = await User.countDocuments({
    $or: [{userName: params.userName}, {email: params.email}],
  });

  if (existingUserCount > 0) {
    return apiError('Existing name or email');
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
  });

  return apiSuccess();
};

exports.login = async function(params) {
  const user = await User.findOne({email: params.email});
  if (!user) {
    return apiError('Invalid email');
  }

  if (checkUserHasToken(user.id)) {
    const token = createToken(user.id);
    return apiSuccess(token);
  }

  const hash = calcPasswordHash(params.password, user.passwordSalt);
  if (hash !== user.passwordSha256 ) {
    return apiError('Fail');
  }
  const token = createToken(user.id);
  return apiSuccess(token);
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

  if (!userId) {
    return apiError('Not logged in');
  }
  const user = await User.findById(userId);
  if (!user) {
    return apiError('Fail');
  }

  const following = await User.findById(params.followingId);
  if (!following) {
    return apiError('Invalid following');
  }

  // user's following count ++, following's follower count ++, create follow relation
  const newFollowingCount = user.followingCount + 1;
  await User.findByIdAndUpdate(userId, {followingCount: newFollowingCount});

  const newFollowerCount = following.followerCount + 1;
  await User.findByIdAndUpdate(params.followingId, {followerCount: newFollowerCount});

  await UserFollowUser.create({
    follower: user,
    following: following,
  });

  return apiSuccess();
};


exports.unfollow = async function(params) {
  const userId = getUserId(params.token);

  if (!userId) {
    return apiError('Not logged in');
  }
  const user = await User.findById(userId);
  if (!user) {
    return apiError('Fail');
  }

  const unfollow = await User.findById(params.unfollowId);
  if (!unfollow) {
    return apiError('Invalid user to unfollow');
  }

  // user's following count --, unfollow's follower count --, remove userFollowUser relation
  const newFollowingCount = user.followingCount - 1;
  await User.findByIdAndUpdate(userId, {followingCount: newFollowingCount});

  const newFollowerCount = unfollow.followerCount - 1;
  await User.findByIdAndUpdate(params.unfollowId, {followerCount: newFollowerCount});

  const followRelation = await UserFollowUser.findOne({follower: user, following: unfollow});
  await UserFollowUser.findByIdAndRemove(followRelation.id);

  return apiSuccess();
};
