const Poem = require('../models/Poem');
const UserLikePoem = require('../models/UserLikePoem');
const UserVisitPoem = require('../models/UserVisitPoem');
const User = require('../models/User');
const {apiError, apiSuccess, FORBIDDEN, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED} = require('./utils');
const {PUBLIC, COMMUNITY} = require('./utils');
const {getUserId, checkTokenValid} = require('../services/tokenService');
const {updateLastActiveDate} = require('./userController');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.create = async function(params) {
  const userId = getUserId(params.token);
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

  updateLastActiveDate(userId);
  return apiSuccess(poem._id);
};

exports.edit = async function(params) {
  const userId = getUserId(params.token);
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

  updateLastActiveDate(userId);

  return apiSuccess();
};

exports.delete = async function(params) {
  const userId = getUserId(params.token);
  const poem = await Poem.findOne({_id: new ObjectId(params.poemId), authorId: new ObjectId(userId)});
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  await Poem.findByIdAndRemove(poem.id);
  return apiSuccess();
};

exports.like = async function(params) {
  const userId = getUserId(params.token);
  const poemCount = await Poem.find({_id: params.poemId}).count();
  if (poemCount === 0) {
    return apiError(NOT_FOUND);
  }

  // If already liked poemId
  const existingCount = await UserLikePoem.find({userId: userId, poemId: params.poemId}).count();
  if (existingCount > 0) {
    return apiError(BAD_REQUEST);
  }

  await Promise.all([
    UserLikePoem.create({
      userId: userId,
      poemId: params.poemId,
    }),

    Poem.findByIdAndUpdate(params.poemId,
        {$inc: {likeCount: 1}}),
  ]);

  return apiSuccess();
};

exports.unlike = async function(params) {
  const userId = getUserId(params.token);
  const poemCount = await Poem.find({_id: params.poemId});
  if (poemCount === 0) {
    return apiError(NOT_FOUND);
  }

  // If did not like poem
  const likeRelationCount = await UserLikePoem.find({userId: userId, poemId: params.poemId}).count();
  if (likeRelationCount === 0) {
    return apiError(BAD_REQUEST);
  }

  await Promise.all([
    UserLikePoem.deleteMany({userId: userId, poemId: params.poemId}),
    Poem.findByIdAndUpdate(params.poemId,
        {$inc: {likeCount: -1}}),
  ]);

  return apiSuccess();
};

exports.visit = async function(params) {
  const userId = getUserId(params.token);
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
        {$inc: {viewCount: 1}}),
    User.findByIdAndUpdate(poem.authorId,
        {$inc: {viewCount: 1}}),
  ]);

  return apiSuccess();
};

exports.detail = async function(params) {
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  // Poem is open to public, community or private
  if (poem.visibility === PUBLIC) {
    return apiSuccess(poem);
  } else if (poem.visibility === COMMUNITY) {
    if (!checkTokenValid(params.token)) {
      return apiError(UNAUTHORIZED);
    }
    return apiSuccess(poem);
  } else {
    if (!checkTokenValid(params.token)) {
      return apiError(UNAUTHORIZED);
    }
    const userId = getUserId(params.token);
    if (poem.authorId === userId) {
      return apiSuccess(poem);
    }
    return apiError(FORBIDDEN);
  }
};

exports.comment = async function(params) {
  const userId = getUserId(params.token);

  const poem = await Poem.findById(params.poemId);
  if (!poem) return apiError(NOT_FOUND);

  await Comment.create({
    poemAuthor: poem.authorId,
    commentAuthor: userId,
    poemId: params.poemId,
    body: params.comment,
    date: params.date,
  });

  await Poem.findByIdAndUpdate(params.poemId,
      {$inc: {commentCount: 1}});

  return apiSuccess();
};

exports.commentDelete = async function(params) {
  const userId = getUserId(params.token);

  const comment = await Comment.findById(params.commentId);
  if (!comment) {
    return apiError(NOT_FOUND);
  }

  const poem = await Poem.findById(comment.poem);
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  if ((userId == comment.commentAuthor) || (userId == poem.authorId)) {
    await Comment.findByIdAndRemove(params.commentId);
    await Poem.findByIdAndUpdate(poem.id,
        {$inc: {commentCount: -1}});
    return apiSuccess();
  }
  return apiError(FORBIDDEN);
};

exports.likeStatus = async function(params) {
  const userId = getUserId(params.token);
  const arr = [];
  for (let i = 0; i < params.poemIds.length; i++) {
    const count = await UserLikePoem.find({poem: params.poemIds[i], userId: userId}).count();
    if (count === 0) {
      arr.push(false);
    } else {
      arr.push(true);
    }
  }
  return apiSuccess(arr);
};
