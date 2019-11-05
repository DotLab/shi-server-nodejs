const Poem = require('../models/Poem');
const Comment = require('../models/Comment');
const UserLikePoem = require('../models/UserLikePoem');
const UserVisitPoem = require('../models/UserVisitPoem');
const UserFollowUser = require('../models/UserFollowUser');
const User = require('../models/User');
const {apiError, apiSuccess, FORBIDDEN, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED} = require('./utils');
const {PUBLIC, COMMUNITY} = require('./utils');
const tokenService = require('../services/tokenService');
const userController = require('./userController');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const {FILTER_ALL, FILTER_FOLLOWING, INVALID} = require('./utils');
const {checkTokenValid, getUserId} = require('../services/tokenService');
const {handlePoemSort} = require('./queryHandler');

exports.create = async function(params) {
  const userId = tokenService.getUserId(params.token);
  const poem = await Poem.create({
    authorId: userId,
    title: params.title,
    body: params.body,
    writtenDate: params.date,
    lastEditDate: params.date,
    visibility: params.visibility,
    align: params.align,
    likeCount: 0,
    viewCount: 0,
    commentCount: 0,
  });
  // No await since lastActiveDate is not used in the response
  userController.updateLastActiveDate(userId);

  return apiSuccess(poem._id);
};

exports.edit = async function(params) {
  const userId = tokenService.getUserId(params.token);
  const poem = await Poem.findOne({_id: new ObjectId(params.poemId), authorId: new ObjectId(userId)});
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  await Poem.findByIdAndUpdate(params.poemId, {
    $set: {
      title: params.title,
      body: params.body,
      lastEditDate: params.date,
      visibility: params.visibility,
      align: params.align,
    },
  });
  // No await since lastActiveDate is not used in the response
  userController.updateLastActiveDate(userId);

  return apiSuccess();
};

exports.delete = async function(params) {
  const userId = tokenService.getUserId(params.token);
  const poem = await Poem.findOne({_id: new ObjectId(params.poemId), authorId: new ObjectId(userId)});
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  await Poem.findByIdAndRemove(poem.id);

  return apiSuccess();
};

exports.like = async function(params) {
  const userId = tokenService.getUserId(params.token);
  const poemCount = await Poem.find({_id: params.poemId}).count();
  if (poemCount === 0) {
    return apiError(NOT_FOUND);
  }
  // If the user already liked poemId
  const existingCount = await UserLikePoem.find({userId: userId, poemId: params.poemId}).count();
  if (existingCount > 0) {
    return apiError(BAD_REQUEST);
  }

  await Promise.all([
    UserLikePoem.create({
      userId: userId,
      poemId: params.poemId,
    }),
    Poem.findByIdAndUpdate(params.poemId, {
      $inc: {likeCount: 1},
    }),
  ]);

  return apiSuccess();
};

exports.unlike = async function(params) {
  const userId = tokenService.getUserId(params.token);
  const poemCount = await Poem.find({_id: params.poemId});
  if (poemCount === 0) {
    return apiError(NOT_FOUND);
  }
  // If the user did not like poem
  const likeRelationCount = await UserLikePoem.find({userId: userId, poemId: params.poemId}).count();
  if (likeRelationCount === 0) {
    return apiError(BAD_REQUEST);
  }

  await Promise.all([
    UserLikePoem.deleteMany({userId: userId, poemId: params.poemId}),
    Poem.findByIdAndUpdate(params.poemId,
        {$inc: {likeCount: -1},
        }),
  ]);

  return apiSuccess();
};

exports.visit = async function(params) {
  const userId = tokenService.getUserId(params.token);
  if (!userId) {
    return apiSuccess();
  }
  const poemCount = await Poem.find({_id: params.poemId});
  if (poemCount === 0) {
    return apiError(NOT_FOUND);
  }
  // If already visited poemId
  const existingCount = await UserVisitPoem.find({userId: userId, poemId: params.poemId}).count();
  if (existingCount > 0) {
    return apiSuccess();
  }

  await UserVisitPoem.create({
    userId: userId,
    poemId: params.poemId,
  });
  const poem = await Poem.findById(params.poemId);
  // Update viewCount for Poem and User
  await Promise.all([
    Poem.findByIdAndUpdate(params.poemId,
        {$inc: {viewCount: 1},
        }),
    User.findByIdAndUpdate(poem.authorId,
        {$inc: {viewCount: 1},
        }),
  ]);

  return apiSuccess();
};

exports.detail = async function(params) {
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  if (poem.visibility === PUBLIC) {
    return apiSuccess(poem);
  }
  if (poem.visibility === COMMUNITY) {
    if (!tokenService.checkTokenValid(params.token)) {
      return apiError(UNAUTHORIZED);
    }
    return apiSuccess(poem);
  }
  // poem.visibility === PRIVATE
  if (!tokenService.checkTokenValid(params.token)) {
    return apiError(UNAUTHORIZED);
  }
  const userId = tokenService.getUserId(params.token);
  if (poem.authorId == userId) {
    return apiSuccess(poem);
  }
  return apiError(FORBIDDEN);
};

exports.comment = async function(params) {
  const userId = tokenService.getUserId(params.token);
  const poem = await Poem.findById(params.poemId);
  if (!poem) return apiError(NOT_FOUND);

  await Comment.create({
    poemAuthorId: poem.authorId,
    commentAuthorId: userId,
    poemId: params.poemId,
    body: params.comment,
    date: params.date,
  });
  await Poem.findByIdAndUpdate(params.poemId,
      {$inc: {commentCount: 1},
      });

  return apiSuccess();
};

exports.commentDelete = async function(params) {
  const userId = tokenService.getUserId(params.token);
  const comment = await Comment.findById(params.commentId);
  if (!comment) {
    return apiError(NOT_FOUND);
  }
  if ((userId != comment.commentAuthorId) && (userId != comment.poemAuthorId)) {
    return apiError(FORBIDDEN);
  }

  await Promise.all([
    Comment.findByIdAndRemove(params.commentId),
    Poem.findByIdAndUpdate(comment.poemId,
        {$inc: {commentCount: -1},
        }),
  ]);

  return apiSuccess();
};

exports.likeStatus = async function(params) {
  const userId = tokenService.getUserId(params.token);
  const arr = [];
  for (let i = 0; i < params.poemIds.length; i++) {
    const count = await UserLikePoem.find({poemId: params.poemIds[i], userId: userId}).count();
    if (count === 0) {
      arr.push(false);
    } else {
      arr.push(true);
    }
  }
  return apiSuccess(arr);
};

exports.listingQuery = async function(params) {
  let query = Poem.find({});

  // filter
  if (params.filter === FILTER_FOLLOWING) {
    if (!checkTokenValid(params.token)) {
      return apiError(FORBIDDEN);
    }
    const userId = tokenService.getUserId(params.token);
    // poemFollowingFilter(userId, query);
    query = UserFollowUser.aggregate([
      {$match: {follower: new ObjectId(userId)}},
      {
        $lookup:
        {
          from: 'users',
          localField: 'following',
          foreignField: '_id',
          as: 'follow',
        },
      },
      {
        $unwind: {path: '$follow'},
      },
      {
        $replaceWith: '$follow',
      },
      {
        $lookup:
        {
          from: 'poems',
          localField: '_id',
          foreignField: 'authorId',
          as: 'poems',
        },
      },
      {
        $unwind: {path: '$poems'},
      },
      {
        $replaceWith: '$poems',
      },
      {$match:
        {visibility: {$in: [PUBLIC, COMMUNITY]}},
      },
    ]);
  } else if (params.filter === FILTER_ALL) {
    query = Poem.find({visibility: {$in: [PUBLIC]}});
  } else {
    return apiError(BAD_REQUEST);
  }

  // search
  if (params.search != undefined) {
    query = query.find({title: params.search});
  }

  // sort and order
  if (handlePoemSort(params.sort, params.order, query) == INVALID) {
    return apiError(BAD_REQUEST);
  }

  // skip
  query = query.skip(params.skip);

  // limit
  query = query.limit(params.limit);

  const res = await query.exec();
  if (!checkTokenValid(params.token)) {
    return apiSuccess(res);
  }

  const userId = tokenService.getUserId(params.token);
  const counts = await Promise.all(res.map((x) => {
    return UserLikePoem.find({
      userId: userId, poemId: x._id,
    }).count().exec();
  }));

  counts.forEach((count, i) => {
    res[i].liked = count === 0 ? false : true;
  });

  return apiSuccess(res);
};

exports.commentList = async function(params) {
  const count = await Poem.find({_id: params.poemId}).count();
  if (count === 0) {
    return apiError(BAD_REQUEST);
  }

  const comments = await Comment.find({poemId: params.poemId}).lean().exec();
  const userId = tokenService.getUserId(params.token);
  comments.forEach((comment) => {
    comment.isOwner = (comment.poemAuthorId == userId || comment.commentAuthorId == userId) ? true : false;
  });

  return apiSuccess(comments);
};
