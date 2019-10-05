const crypto = require('crypto');

const PASSWORD_ENCODING = 'base64';
const PASSWORD_SALT_LENGTH = 64;
const PASSWORD_HASHER = 'sha256';

const API_SUCCESS = 'SUCCESS';
const API_ERROR = 'ERROR';
const User = require('../models/User');

exports.apiSuccess = function(payload) {
  return {status: API_SUCCESS, payload};
};

exports.apiError = function(payload) {
  return {status: API_ERROR, payload};
};

exports.genPasswordSalt = function() {
  return crypto.randomBytes(PASSWORD_SALT_LENGTH).toString(PASSWORD_ENCODING);
};

exports.genToken = function(len) {
  if (len === undefined) {
    return crypto.randomBytes(PASSWORD_SALT_LENGTH).toString(PASSWORD_ENCODING);
  } else return crypto.randomBytes(len).toString(PASSWORD_ENCODING);
};

exports.calcPasswordHash = function(password, salt) {
  const hasher = crypto.createHash(PASSWORD_HASHER);
  hasher.update(password);
  hasher.update(salt);
  return hasher.digest(PASSWORD_ENCODING);
};

exports.updateUser = function(id, specs) {
  User.findByIdAndUpdate(id, specs);
};
