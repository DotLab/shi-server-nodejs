const User = require('../models/User');
const UserFollowUser = require('../models/UserFollowUser');
const {apiError, apiSuccess, FORBIDDEN} = require('./utils');
const {checkTokenValid, getUserId} = require('../services/tokenService');
const {handleSort} = require('./queryHandler');

exports.listingQuery = async function(params) {
  let query = User.find({}).select('id displayName followingCount followerCount lastActive viewCount');

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
  if (params.filter === 'all') {
    query = query.find({});
  } else if (params.filter === 'follow') {
    if (!checkTokenValid(params.token)) {
      return apiError(FORBIDDEN);
    }
    const userId = getUserId(params.token);
    // TODO
    // query = query.aggregate([{$lookup: {from: 'userfollowusers', localField: 'id', foreignField: 'follower'}}]);

    const following = await UserFollowUser.find({follower: userId}).select('following');
    const arr = [];
    following.forEach((x) => arr.push(x.following));
    query = query.find({_id: {$in: arr}});
  } else {
    return apiError(FORBIDDEN);
  }

  // sort and order
  if (handleSort(params.sort, params.order, query) == 'invalid') {
    return apiError(FORBIDDEN);
  }

  // skip
  query = query.skip(params.skip);

  // limit
  query = query.limit(params.limit);

  const res = await query.exec();
  return apiSuccess(res);
};
