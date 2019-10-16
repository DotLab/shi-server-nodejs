const crypto = require('crypto');
const {checkTokenValid, getUserId} = require('../services/tokenService');
const User = require('../models/User');
const UserFollowUser = require('../models/UserFollowUser');

const PASSWORD_ENCODING = 'base64';
const PASSWORD_SALT_LENGTH = 64;
const PASSWORD_HASHER = 'sha256';

const API_SUCCESS = 'SUCCESS';
const API_ERROR = 'ERROR';

exports.STRING = 'string';
exports.NUMBER = 'number';

const apiSuccess = function(payload) {
  return {status: API_SUCCESS, payload};
};

const apiError = function(payload) {
  return {status: API_ERROR, payload};
};

exports.apiSuccess = apiSuccess;
exports.apiError = apiError;

exports.genSecureRandomString = function(length) {
  if (length === undefined) {
    return crypto.randomBytes(PASSWORD_SALT_LENGTH).toString(PASSWORD_ENCODING);
  } else return crypto.randomBytes(length).toString(PASSWORD_ENCODING);
};

exports.calcPasswordHash = function(password, salt) {
  const hasher = crypto.createHash(PASSWORD_HASHER);
  hasher.update(password);
  hasher.update(salt);
  return hasher.digest(PASSWORD_ENCODING);
};

exports.checkType = function(type, variable, ) {
  if ((typeof variable) === type) {
    return true;
  }
  return false;
};


async function findFollowing(userId, query) {
  const following = await UserFollowUser.find({follower: userId}).select('following');
  const arr = [];
  following.forEach((x) => arr.push(x));
  return query.find({id: {$in: arr}});
}


exports.handleSort = function(sort, order, query) {
  if (sort !== undefined) {
    if (order !== 'asc' && order !== 'desc') {
      return apiError('Fail');
    }
  } else return;

  if (sort === 'view') {
    query = (order === 'desc' ? query.sort({viewCount: -1}) : query.sort({viewCount: 1}));
  } else if (sort === 'like') {
    query = (order === 'desc' ? query.sort({followerCount: -1}) : query.sort({followerCount: 1}));
  } else if (sort === 'activeDate') {
    query = (order === 'desc' ? query.sort({lastActive: -1}) : query.sort({lastActive: 1}));
  }

  return apiError('Fail');
};


exports.handleFilter = function(filter, token, query) {
  if (filter === 'all') {
    query = query.find({});
  } else if (filter === 'follow') {
    if (!checkTokenValid(token)) {
      return apiError('You are not logged in');
    }
    const userId = getUserId(token);
    // TODO
    query = findFollowing(userId, query);
  } else {
    return apiError('Fail');
  }
};

exports.handleSearch = function(search, query) {
  if (search != undefined) {
    query = User.find({displayName: search});
  }
};

exports.handleActiveYearLimit = function(activeYearLimit, query) {
  if (activeYearLimit != undefined) {
    const d = new Date().setFullYear(activeYearLimit + 1);
    query = query.find({lastActive: {$lt: d}});
  }
};

