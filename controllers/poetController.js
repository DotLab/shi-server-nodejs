const User = require('../models/User');
const UserFollowUser = require('../models/UserFollowUser');
const {apiError, apiSuccess} = require('./utils');
const {checkTokenValid, getUserId} = require('../services/tokenService');
const {handleFilter, handleSort, handleSearch, handleActiveYearLimit} = require('./queryHandler');

exports.listingQuery = async function(params) {
  let query = User.find({}).select('id displayName followingCount followerCount lastActive viewCount');

  // search
  if (handleSearch(params.search, query) == 'invalid') {
    return apiError('Invalid');
  }

  // activeYearLimit
  if (handleActiveYearLimit(params.activeYearLimit, query) == 'invalid') {
    return apiError('Invalid');
  }

  // filter
  if (await handleFilter(params.filter, query) == 'invalid') {
    return apiError('Invalid');
  }
  // if (params.filter === 'all') {
  //   query = query.find({});
  // } else if (params.filter === 'follow') {
  //   if (!checkTokenValid(params.token)) {
  //     return 'invalid';
  //   }
  //   const userId = getUserId(params.token);
  //   // TODO
  //   // query = query.aggregate([{$lookup: {from: 'userfollowusers', localField: 'id', foreignField: 'follower'}}]);

  //   const following = await UserFollowUser.find({follower: userId}).select('following');
  //   const arr = [];
  //   following.forEach((x) => arr.push(x.following));
  //   query = query.find({_id: {$in: arr}});
  //   console.log(await query.exec());
  // } else {
  //   return 'invalid';
  // }

  console.log(await query.exec());
  // sort and order
  if (handleSort(params.sort, params.order, query) == 'invalid') {
    return apiError('Invalid');
  }

  // skip
  query = query.skip(params.skip);

  // limit
  query = query.limit(params.limit);

  const res = await query.exec();
  return apiSuccess(res);
};

