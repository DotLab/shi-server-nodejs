const UserFollowUser = require('../models/UserFollowUser');
const User = require('../models/User');
const {apiError, apiSuccess} = require('./utils');
const {checkTokenValid, getUserId} = require('../services/tokenService');

exports.listing = async function(token) {
  if (token== 'undefined' || !checkTokenValid(token)) {
    // not authorized user, list most viewed poets
    const poets = [];
    const collections = await User.find({}).sort({viewCount: -1});
    collections.forEach((poet) => poets.push(poet));
    return apiSuccess(poets);
  }

  // authorized user, list followers
  const userId = getUserId(token);
  const user = await User.findById(userId);

  const following = await UserFollowUser.find({follower: user});

  const poets = [];
  for (let i = 0; i < user.followingCount; i++) {
    const collections = await User.findOne({id: following[i].following});
    collections.forEach((poet) => poets.push(poet));
  }
  return apiSuccess(poets);
};
