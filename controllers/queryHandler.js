
exports.handleSort = function(sort, order, query) {
  if (sort !== undefined) {
    if (order !== 'asc' && order !== 'desc') {
      return 'invalid';
    }
  } else {
    query = query.sort({viewCount: -1});
    return;
  }

  if (sort === 'view') {
    query = (order === 'desc' ? query.sort({viewCount: -1}) : query.sort({viewCount: 1}));
    return;
  } else if (sort === 'like') {
    query = (order === 'desc' ? query.sort({followerCount: -1}) : query.sort({followerCount: 1}));
    return;
  } else if (sort === 'activeDate') {
    query = (order === 'desc' ? query.sort({lastActive: -1}) : query.sort({lastActive: 1}));
    return;
  }

  return 'invalid';
};

