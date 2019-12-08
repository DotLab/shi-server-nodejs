const QUERY_ASC = 'asc';
const QUERY_DESC = 'desc';
const QUERY_DATE = 'date';
const QUERY_VIEWS = 'views';
const QUERY_LIKES = 'likes';
const QUERY_ALPHABETICAL = 'alphabetical';

exports.handleSort = function(sort, order, query) {
  if (sort) {
    if (order !== QUERY_ASC && order !== QUERY_DESC) {
      throw new Error('Invalid query sort');
    }
  } else {
    query = query.sort({viewCount: -1});
    return;
  }

  if (sort === QUERY_VIEWS) {
    query = (order === QUERY_DESC ? query.sort({viewCount: -1}) : query.sort({viewCount: 1}));
    return;
  } else if (sort === QUERY_LIKES) {
    query = (order === QUERY_DESC ? query.sort({followerCount: -1}) : query.sort({followerCount: 1}));
    return;
  } else if (sort === QUERY_DATE) {
    query = (order === QUERY_DESC ? query.sort({lastActiveDate: -1}) : query.sort({lastActiveDate: 1}));
    return;
  } else if (sort === QUERY_ALPHABETICAL) {
    query = (order === QUERY_DESC ? query.sort({displayName: -1}) : query.sort({displayName: 1}));
    return;
  }

  throw new Error('Invalid input');
};
