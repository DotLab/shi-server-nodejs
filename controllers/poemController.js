const Poem = require('../models/Poem');
const UserLikePoem = require('../models/UserLikePoem');
const UserVisitPoem = require('../models/UserVisitPoem');
const User = require('../models/User');
const {apiError, apiSuccess, FORBIDDEN, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED} = require('./utils');
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
      lastActiveDate: new Date(),
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
  if (poem.privacy === 'public') {
    return apiSuccess(poem);
  } else if (poem.privacy === 'community') {
    if (!checkTokenValid(params.token)) {
      return apiError(UNAUTHORIZED);
    }
    return apiSuccess(poem);
  } else {
    return apiError(FORBIDDEN);
  }
};
