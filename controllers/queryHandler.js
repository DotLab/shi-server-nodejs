
exports.handleSort = function(sort, order, query) {
  if (sort !== undefined) {
    if (order !== 'asc' && order !== 'desc') {
      return 'invalid';
    }
  } else {
    query = query.sort({viewCount: -1});
    return;
  }

  if (sort === 'views') {
    query = (order === 'desc' ? query.sort({viewCount: -1}) : query.sort({viewCount: 1}));
    return;
  } else if (sort === 'likes') {
    query = (order === 'desc' ? query.sort({followerCount: -1}) : query.sort({followerCount: 1}));
    return;
  } else if (sort === 'date') {
    query = (order === 'desc' ? query.sort({lastActiveDate: -1}) : query.sort({lastActiveDate: 1}));
    return;
  }

  return 'invalid';
};

