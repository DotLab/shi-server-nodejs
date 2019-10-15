const Poem = require('../models/Poem');
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
