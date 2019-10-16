const User = require('../models/User');
const {apiError, apiSuccess} = require('./utils');
const {handleFilter, handleSort, handleSearch, handleActiveYearLimit} = require('./utils');

exports.listingQuery = async function(params) {
  let query = User.find({}).select('displayName followingCount followerCount lastActive viewCount');

  // search
  handleSearch(params.search, query);

  // activeYearLimit
  handleActiveYearLimit(params.activeYearLimit, query);

  // filter
  handleFilter(params.filter, params.token, query);

  // sort and order
  handleSort(params.sort, params.order, query);

  // skip
  query = query.skip(params.skip);

  // limit
  query = query.limit(params.limit);

  const res = await query.exec();
  return apiSuccess(res);
};

