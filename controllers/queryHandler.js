const {checkTokenValid, getUserId} = require('../services/tokenService');
const User = require('../models/User');
const UserFollowUser = require('../models/UserFollowUser');

async function findFollowing(userId, query) {
  const following = await UserFollowUser.find({follower: userId}).select('following');

  const arr = [];
  following.forEach((x) => arr.push(x.following));

  query = query.find({_id: {$in: arr}});

  return query;
}


exports.handleSort = function(sort, order, query) {
  if (sort !== undefined) {
    if (order !== 'asc' && order !== 'desc') {
      return 'invalid';
    }
  } else return;

  if (sort === 'view') {
    query = (order === 'desc' ? query.sort({viewCount: -1}) : query.sort({viewCount: 1}));
  } else if (sort === 'like') {
    query = (order === 'desc' ? query.sort({followerCount: -1}) : query.sort({followerCount: 1}));
  } else if (sort === 'activeDate') {
    query = (order === 'desc' ? query.sort({lastActive: -1}) : query.sort({lastActive: 1}));
  }

  return 'invalid';
};


exports.handleFilter = async function(filter, token, query) {
  if (filter === 'all') {
    query = query.find({});
  } else if (filter === 'follow') {
    if (!checkTokenValid(token)) {
      return 'invalid';
    }
    const userId = getUserId(token);
    // TODO
    // query = query.aggregate([{$lookup: {from: 'userfollowusers', localField: 'id', foreignField: 'follower'}}]);

    const following = await UserFollowUser.find({follower: userId}).select('following');
    const arr = [];
    following.forEach((x) => arr.push(x.following));
    query = query.find({_id: {$in: arr}});
    console.log(await query.exec());
  } else {
    return 'invalid';
  }
};

exports.handleSearch = function(search, query) {
  if (search != undefined) {
    query = query.find({displayName: search});
  }
};

exports.handleActiveYearLimit = function(activeYearLimit, query) {
  if (activeYearLimit != undefined) {
    const d = new Date().setFullYear(activeYearLimit + 1);
    query = query.find({lastActive: {$lt: d}});
  }
};

