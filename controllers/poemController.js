const Poem = require('../models/Poem');
const UserLikePoem = require('../models/UserLikePoem');
const UserVisitPoem = require('../models/UserVisitPoem');
const User = require('../models/User');
const {apiError, apiSuccess, FORBIDDEN, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED} = require('./utils');
const {PUBLIC, COMMUNITY} = require('./utils');
const {getUserId, checkTokenValid} = require('../services/tokenService');

exports.create = async function(params) {
  const userId = getUserId(params.token);
  const poem = await Poem.create({
    author: userId,
    title: params.title,
    body: params.body,
    writtenDate: params.date,
    lastEditDate: params.date,
    privacy: params.privacy,
    align: params.align,
    likeCount: 0,
    viewCount: 0,
  });

  await User.findByIdAndUpdate(userId, {
    $set: {
      lastActiveDate: new Date(),
    },
  });

  return apiSuccess(poem._id);
};

exports.edit = async function(params) {
  const userId = getUserId(params.token);
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  if (userId != poem.author) {
    return apiError(FORBIDDEN);
  }
  await Poem.findByIdAndUpdate(params.poemId, {
    $set: {
      title: params.title,
      body: params.body,
      lastEditDate: params.date,
      privacy: params.privacy,
      align: params.align,
    },
  });

  await User.findByIdAndUpdate(userId, {
    $set: {
      lastActiveDate: new Date(),
    },
  });

  return apiSuccess();
};

exports.delete = async function(params) {
  const userId = getUserId(params.token);
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  if (userId != poem.author) {
    return apiError(FORBIDDEN);
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
  const existingCount = await UserLikePoem.find({user: userId, poem: params.poemId}).count();
  if (existingCount > 0) {
    return apiError(BAD_REQUEST);
  }

  await UserLikePoem.create({
    user: userId,
    poem: params.poemId,
  });

  await Poem.findByIdAndUpdate(params.poemId,
      {$inc: {likeCount: 1}});

  return apiSuccess();
};

exports.unlike = async function(params) {
  const userId = getUserId(params.token);
  const poemCount = await Poem.find({_id: params.poemId});
  if (poemCount === 0) {
    return apiError(NOT_FOUND);
  }

  // If did not like poem
  const likeRelationCount = await UserLikePoem.find({user: userId, poem: params.poemId}).count();
  if (likeRelationCount === 0) {
    return apiError(BAD_REQUEST);
  }
  await UserLikePoem.deleteMany({user: userId, poem: params.poemId});

  // decrement likeCount
  await Poem.findByIdAndUpdate(params.poemId,
      {$inc: {likeCount: -1}});

  return apiSuccess();
};

exports.visit = async function(params) {
  const userId = getUserId(params.token);
  const poemCount = await Poem.find({_id: params.poemId});
  if (poemCount === 0) {
    return apiError(NOT_FOUND);
  }

  // If already visited poemId
  const existingCount = await UserVisitPoem.find({user: userId, poem: params.poemId}).count();
  if (existingCount > 0) {
    return apiSuccess();
  }

  await UserVisitPoem.create({
    user: userId,
    poem: params.poemId,
  });

  const poem = await Poem.findById(params.poemId);

  // Update viewCount for Poem and User
  await Poem.findByIdAndUpdate(params.poemId,
      {$inc: {viewCount: 1}});

  await User.findByIdAndUpdate(poem.author,
      {$inc: {viewCount: 1}});

  return apiSuccess();
};

exports.detail = async function(params) {
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  // Poem is open to public, community or private
  if (poem.privacy === PUBLIC) {
    return apiSuccess(poem);
  } else if (poem.privacy === COMMUNITY) {
    if (!checkTokenValid(params.token)) {
      return apiError(UNAUTHORIZED);
    }
    return apiSuccess(poem);
  } else {
    return apiError(FORBIDDEN);
  }
};

exports.comment = async function(params) {
  const userId = getUserId(params.token);

  const poem = await Poem.findById(params.poemId);
  if (!poem) return apiError(NOT_FOUND);

  await Comment.create({
    poemAuthor: poem.author,
    commentAuthor: userId,
    poem: params.poemId,
    body: params.comment,
    date: params.date,
  });
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

  if ((userId == comment.commentAuthor) || (userId == poem.author)) {
    await Comment.findByIdAndRemove(params.commentId);
    return apiSuccess();
  }
  return apiError(FORBIDDEN);
};
