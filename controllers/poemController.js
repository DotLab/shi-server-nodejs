const Poem = require('../models/Poem');
const UserLikePoem = require('../models/UserLikePoem');
const UserVisitPoem = require('../models/UserVisitPoem');
const User = require('../models/User');
const Comment = require('../models/Comment');
const {apiError, apiSuccess, FORBIDDEN, NOT_FOUND} = require('./utils');
const {getUserId, checkTokenValid} = require('../services/tokenService');

exports.create = async function(params) {
  const userId = getUserId(params.token);
  await Poem.create({
    author: userId,
    title: params.title,
    body: params.body,
    dateWritten: params.date,
    lastEdit: params.date,
    privacy: params.privacy,
    likeCount: 0,
    viewCount: 0,
  });

  await User.findByIdAndUpdate(userId, {
    $set: {
      lastActive: new Date(),
    },
  });

  return apiSuccess();
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
      lastEdit: params.date,
      privacy: params.privacy,
    },
  });

  await User.findByIdAndUpdate(userId, {
    $set: {
      lastActive: new Date(),
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
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError(NOT_FOUND);
  }

  // If already liked poemId
  const existing = await UserLikePoem.find({user: userId, poem: params.poemId});
  if (existing.length) {
    return apiError(FORBIDDEN);
  }

  await UserLikePoem.create({
    user: userId,
    poem: poem.id,
  });

  const newLikeCount = poem.likeCount + 1;
  await Poem.findByIdAndUpdate(poem.id, {likeCount: newLikeCount});

  return apiSuccess();
};

exports.unlike = async function(params) {
  const userId = getUserId(params.token);
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError('Poem does not exist');
  }

  // If did not like poem
  const likeRelation = await UserLikePoem.findOne({user: userId, poem: poem});
  if (!likeRelation) {
    return apiError(FORBIDDEN);
  }
  await UserLikePoem.findByIdAndRemove(likeRelation.id);

  // decrement likeCount
  const newLikeCount = poem.likeCount - 1;
  await Poem.findByIdAndUpdate(poem.id, {likeCount: newLikeCount});

  return apiSuccess();
};

exports.visit = async function(params) {
  // authorized/unauthorized User
  if (params.token !== undefined) {
    if (!checkTokenValid(params.token)) {
      return apiError(FORBIDDEN);
    }
    const userId = getUserId(params.token);
    const user = await User.findById(userId);
    const poem = await Poem.findById(params.poemId);
    if (!poem) {
      return apiError(NOT_FOUND);
    }

    // If already visited poemId
    const existing = await UserVisitPoem.find({user: userId, poem: params.poemId});
    if (existing.length) {
      return apiSuccess(poem);
    }

    await UserVisitPoem.create({
      user: userId,
      poem: poem.id,
    });

    // Update viewCount for Poem and User
    const newViewCount = poem.viewCount + 1;
    await Poem.findByIdAndUpdate(poem.id, {viewCount: newViewCount});

    const newUserViewCount = user.viewCount + 1;
    await User.findByIdAndUpdate(userId, {viewCount: newUserViewCount});

    return apiSuccess(poem);
  } else {
    const poem = await Poem.findById(params.poemId);
    if (!poem) {
      return apiError(NOT_FOUND);
    }
    return apiSuccess(poem);
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
