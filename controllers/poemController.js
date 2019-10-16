const Poem = require('../models/Poem');
const Comment = require('../models/Comment');
const UserLikedPoem = require('../models/UserLikedPoem');
const UserFollowUser = require('../models/UserFollowUser');
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

  await User.findByIdAndUpdate(userId, {
    $set: {
      lastActive: new Date(),
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


exports.listing = async function(token) {
  if (token== 'undefined' || !checkTokenValid(token)) {
    // not authorized user, list most viewed poems
    const poems = [];
    const collections = await Poem.find({}).sort({viewCount: -1});
    collections.forEach((poem) => poems.push(poem));
    return apiSuccess(poems);
  }

  // authorized user, list follower's poems
  const userId = getUserId(token);
  const user = await User.findById(userId);

  const following = await UserFollowUser.find({follower: user});

  const poems = [];
  for (let i = 0; i < user.followingCount; i++) {
    const collections = await Poem.find({author: following[i].following});
    collections.forEach((poem) => poems.push(poem));
  }
  return apiSuccess(poems);
};


exports.comment = async function(params) {
  if (!checkTokenValid(params.token)) {
    return apiError('You are not logged in');
  }
  const userId = getUserId(params.token);
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
  const user = await User.findById(userId);
  if (!user) {
    return apiError('Fail');
  }


  const comment = await Comment.findById(params.commentId);
  if (!comment) {
    return apiError('Comment does not exist');
  }

  const poem = await Poem.findById(comment.poem);
  if (!poem) {
    return apiError('Poem does not exist');
  }


  if ((userId == comment.commentAuthor) || (userId == poem.author)) {
    await Comment.findByIdAndRemove(params.commentId);
    return apiSuccess();
  }
  return apiError('Fail');
};
