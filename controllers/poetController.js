const User = require('../models/User');
const {apiError, apiSuccess} = require('./utils');
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
  if (handleFilter(params.filter, params.token, query) == 'invalid') {
    return apiError('Invalid');
  }

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

