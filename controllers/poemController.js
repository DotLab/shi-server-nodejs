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
    // for debug purpose
    // author: params.author,
    author: userId,
    title: params.title,
    body: params.body,
    dateUploaded: params.date,
    privacy: params.privacy,
  });
  return apiSuccess();
};
