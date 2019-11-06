const QUERY_ASC = 'asc';
const QUERY_DESC = 'desc';
const QUERY_DATE = 'date';
const QUERY_VIEWS = 'views';
const QUERY_LIKES = 'likes';
const QUERY_ALPHABETICAL = 'alphabetical';

<<<<<<< HEAD
exports.handlePoetSort = function(sort, order, query) {
  if (sort !== undefined) {
=======
exports.handleSort = function(sort, order, query) {
  if (sort) {
>>>>>>> f820e1ba0ed09970c3a56fff50598f67fdf72f9c
    if (order !== QUERY_ASC && order !== QUERY_DESC) {
      throw new Error();
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

  throw new Error();
};

exports.handlePoemSort = function(sort, order, query) {
  if (sort !== undefined) {
    if (order !== QUERY_ASC && order !== QUERY_DESC) {
      return INVALID;
    }
  } else {
    query = query.sort({viewCount: -1});
    return;
  }

  if (sort === QUERY_VIEWS) {
    query = (order === QUERY_DESC ? query.sort({viewCount: -1}) : query.sort({viewCount: 1}));
    return;
  } else if (sort === QUERY_LIKES) {
    query = (order === QUERY_DESC ? query.sort({likeCount: -1}) : query.sort({likeCount: 1}));
    return;
  } else if (sort === QUERY_DATE) {
    query = (order === QUERY_DESC ? query.sort({writtenDate: -1}) : query.sort({writtenDate: 1}));
    return;
  }

  return INVALID;
};
