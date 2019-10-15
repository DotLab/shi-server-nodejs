const Poem = require('../models/Poem');
const UserLikedPoem = require('../models/UserLikedPoem');
const User = require('../models/User');
const {apiError, apiSuccess} = require('./utils');
const {checkTokenValid, getUserId} = require('../services/tokenService');

exports.create = async function(params) {
  // check if user is logged in
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);
  await Poem.create({
    author: userId,
    title: params.title,
    body: params.body,
    dateWritten: params.date,
    lastEdit: params.date,
    privacy: params.privacy,
    likeCount: 0,
  });
  return apiSuccess();
};

exports.edit = async function(params) {
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError('Fail');
  }

  if (userId != poem.author) {
    return apiError('Fail');
  }
  await Poem.findByIdAndUpdate(params.poemId, {
    $set: {
      title: params.title,
      body: params.body,
      lastEdit: params.date,
      privacy: params.privacy,
    },
  });
  return apiSuccess();
};

exports.delete = async function(params) {
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError('Poem does not exist');
  }

  if (userId != poem.author) {
    return apiError('Fail');
  }
  await Poem.findByIdAndRemove(poem.id);
  return apiSuccess();
};

exports.like = async function(params) {
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);
  const user = await User.findById(userId);
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError('Poem does not exist');
  }

  const newLikeCount = poem.likeCount + 1;
  await UserLikedPoem.create({
    user: user,
    poem: poem,
  });

  await Poem.findByIdAndUpdate(poem.id, {likeCount: newLikeCount});
  return apiSuccess();
};


exports.unlike = async function(params) {
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);
  const user = await User.findById(userId);
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError('Poem does not exist');
  }

  // remove relation from UserLikedPoem
  const likeRelation = await UserLikedPoem.findOne({user: user, poem: poem});
  await UserLikedPoem.findByIdAndRemove(likeRelation.id);

  // decrement likeCount
  const newLikeCount = poem.likeCount - 1;
  await Poem.findByIdAndUpdate(poem.id, {likeCount: newLikeCount});
  return apiSuccess();
};
