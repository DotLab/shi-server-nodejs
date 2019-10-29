const User = require('../models/User');
const Poem = require('../models/Poem');
const UserFollowUser = require('../models/UserFollowUser');
const {apiError, apiSuccess, FORBIDDEN} = require('./utils');
const {PUBLIC, COMMUNITY} = require('./utils');
const {checkTokenValid, getUserId} = require('../services/tokenService');
const {handleSort} = require('./queryHandler');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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
    if (userId === params.poetId) {
      const poems = await Poem.find({authorId: userId}).exec();
      return apiSuccess(poems);
    } else {
      // else find all public and community poems
      const poems = await Poem.find({authorId: params.poetId, visibility: {$in: [PUBLIC, COMMUNITY]}});
      return apiSuccess(poems);
    }
  }

  // if token is invalid, find all public poems
  const poems = await Poem.find({authorId: params.poetId, visibility: PUBLIC});
  return apiSuccess(poems);
};

exports.detail = async function(params) {
  const poet = await User.find({userName: params.userName}).select('id userName displayName followingCount followerCount lastActive viewCount');
  return apiSuccess(poet);
};

exports.following = async function(params) {
  const Id = await User.find({userName: params.userName}).select('id');
  const userId = Id[0].id;
  const poets = await UserFollowUser.aggregate([
    {$match: {follower: new ObjectId(userId)}},
    {
      $lookup:
      {
        from: 'users',
        localField: 'following',
        foreignField: '_id',
        as: 'follow',
      },
    },
    {
      $unwind: {path: '$follow'},
    },
    {
      $replaceWith: '$follow',
    },
    {
      $project: {'userName': 1, 'displayName': 1, 'followingCount': 1,
        'followerCount': 1, 'lastActiveDate': 1, 'viewCount': 1},
    },

  ]);

  return apiSuccess(poets);
};

exports.follower = async function(params) {
  const Id = await User.find({userName: params.userName}).select('id');
  const userId = Id[0].id;
  const poets = await UserFollowUser.aggregate([
    {$match: {following: new ObjectId(userId)}},
    {
      $lookup:
      {
        from: 'users',
        localField: 'follower',
        foreignField: '_id',
        as: 'follow',
      },
    },
    {
      $unwind: {path: '$follow'},
    },
    {
      $replaceWith: '$follow',
    },
    {
      $project: {'userName': 1, 'displayName': 1, 'followingCount': 1,
        'followerCount': 1, 'lastActiveDate': 1, 'viewCount': 1},
    },

  ]);

  return apiSuccess(poets);
};

exports.followStatus = async function(params) {
  const userId = getUserId(params.token);
  const arr = [];
  for (let i = 0; i < params.userIds.length; i++) {
    const count = await UserFollowUser.find({following: params.userIds[i], follower: userId}).count();
    if (count === 0) {
      arr.push(false);
    } else {
      arr.push(true);
    }
  }
  return apiSuccess(arr);
};
