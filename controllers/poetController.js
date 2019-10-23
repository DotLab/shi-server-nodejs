const User = require('../models/User');
const Poem = require('../models/Poem');
const UserFollowUser = require('../models/UserFollowUser');
const {apiError, apiSuccess, FORBIDDEN} = require('./utils');
const {PUBLIC, COMMUNITY} = require('./utils');
const {checkTokenValid, getUserId} = require('../services/tokenService');
const {handleSort} = require('./queryHandler');

const FILTER_ALL = 'all';
const FILTER_FOLLOW = 'follow';
const INVALID = 'invalid';


exports.listingQuery = async function(params) {
  let query = User.find({}).select('id userName displayName followingCount followerCount lastActiveDate viewCount');

  // search
  if (params.search != undefined) {
    query = query.find({displayName: params.search});
  }

  // activeYearLimit
  if (params.activeYearLimit != undefined) {
    const d = new Date().setFullYear(params.activeYearLimit + 1);
    query = query.find({lastActive: {$lt: d}});
  }

  // filter
  if (params.filter === FILTER_FOLLOW) {
    if (!checkTokenValid(params.token)) {
      return apiError(FORBIDDEN);
    }
    const userId = getUserId(params.token);
    const following = await UserFollowUser.find({follower: userId}).select('following');
    const arr = [];
    following.forEach((x) => arr.push(x.following));
    query = query.find({_id: {$in: arr}});
  } else if (params.filter !== FILTER_ALL) {
    return apiError(FORBIDDEN);
  }

  // sort and order
  if (handleSort(params.sort, params.order, query) == INVALID) {
    return apiError(FORBIDDEN);
  }

  // skip
  query = query.skip(params.skip);

  // limit
  query = query.limit(params.limit);

  const res = await query.lean().exec();

  if (!checkTokenValid(params.token)) {
    return apiSuccess(res);
  }

  const userId = getUserId(params.token);

  // for (let i = 0; i < res.length; i++) {
  //   const count = await UserFollowUser.find({
  //     follower: userId, following: res[i]._id,
  //   }).count().exec();
  //   res[i].isFollowing = count === 0 ? false : true;
  // }

  const counts = await Promise.all(res.map((x) => {
    return UserFollowUser.find({
      follower: userId, following: x._id,
    }).count().exec();
  }));

  counts.forEach((count, i) => {
    res[i].isFollowing = count === 0 ? false : true;
  });

  return apiSuccess(res);
};

exports.poems = async function(params) {
  // if token is valid
  if (checkTokenValid(params.token)) {
    const userId = getUserId(params.token);
    // if user is target user, find all poems
    if (userId === params.targetUser) {
      const poems = await Poem.find({author: userId}).exec();
      return apiSuccess(poems);
    } else {
      // else find all public and community poems
      const poems = await Poem.find({author: params.targetUser, privacy: {$in: [PUBLIC, COMMUNITY]}});
      return apiSuccess(poems);
    }
  }

  // if token is invalid, find all public poems
  const poems = await Poem.find({author: params.targetUser, privacy: PUBLIC});
  return apiSuccess(poems);
};
