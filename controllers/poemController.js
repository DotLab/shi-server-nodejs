const Poem = require('../models/Poem');
const User = require('../models/User');
const Comment = require('../models/Comment');
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
    return apiError('Poem does not exist');
  }

  if (userId != poem.author) {
    return apiError('Fail');
  }
  await Poem.findByIdAndUpdate(params.poemId, {

    title: params.title,
    body: params.body,
    dateEdit: params.date,
    privacy: params.privacy,
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
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError('Poem does not exist');
  }

  const newLikeCount = poem.likeCount + 1;
  const newLike = poem.like;
  newLike.push(userId);

  console.log(poem);
  await Poem.findByIdAndUpdate(poem.id, {like: newLike, likeCount: newLikeCount});
  return apiSuccess();
};


exports.unlike = async function(params) {
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);
  const poem = await Poem.findById(params.poemId);
  if (!poem) {
    return apiError('Poem does not exist');
  }

  const newLikeCount = poem.likeCount - 1;
  const newLike = poem.like;
  newLike.pop(userId);

  await Poem.findByIdAndUpdate(poem.id, {like: newLike, likeCount: newLikeCount});
  return apiSuccess();
};


exports.listing = async function(token) {
  if (!checkTokenValid(token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(token);

  if (!userId) {
    return apiError('Not logged in');
  }
  const user = await User.findById(userId);
  if (!user) {
    return apiError('Fail');
  }

  // for each of the following User, get their latest 5 poems and send back
  const following = user.following;
  const poems = [];
  for (let i = 0; i < user.followingCount; i++) {
    const collections = await Poem.find({author: following[i]._id});

    collections.forEach((poem) => poems.push(poem));
    console.log(poems);
  }
  return apiSuccess(poems);
};


exports.comment = async function(params) {
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);

  if (!userId) {
    return apiError('Not logged in');
  }
  const user = await User.findById(userId);
  if (!user) {
    return apiError('Fail');
  }
  const poem = await Poem.findById(params.poemId);
  if (!poem) return apiError('Invalid poem');

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
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);

  // console.log(params.token);
  if (!userId) {
    return apiError('Not logged in');
  }
  const user = await User.findById(userId);
  if (!user) {
    return apiError('Fail');
  }


  const comment = await Comment.findById(params.commentId);
  // console.log(comment);

  if (!comment) {
    return apiError('Comment does not exist');
  }

  const poem = await Poem.findById(comment.poem);

  if (!poem) {
    return apiError('Poem does not exist');
  }


  if ((userId == comment.commentAuthor) || (poem.author == userId)) {
    await Comment.findByIdAndRemove(params.commentId);
    return apiSuccess();
  } else {
    return apiError('Fail');
  }
};
