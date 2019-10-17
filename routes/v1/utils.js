const {apiError, BAD_REQUEST, UNAUTHORIZED} = require('../../controllers/utils');
const {checkTokenValid} = require('../../services/tokenService');
const mongoose = require('mongoose');

exports.STRING = 'string';
exports.NUMBER = 'number';
exports.DATE = 'date';
exports.OBJECT_ID = 'objectId';

exports.createTypeChecker = function(params) {
  return function(req, res, next) {
    for (const key in params) {
      // Key is optional or required
      if (key[0] === '-') {
        // Optional key may not exist
        const keySlice = key.slice(1);
        if (req.body[keySlice] === undefined) {
          continue;
        } else {
          if (!checkType(params[key], req.body[keySlice])) {
            return res.json(apiError(BAD_REQUEST));
          }
        }
      } else {
        if (!checkType(params[key], req.body[key])) {
          return res.json(apiError(BAD_REQUEST));
        }
      }
    }
    next();
  };
};

exports.checkToken = function() {
  return function(req, res, next) {
    if (!checkTokenValid(req.body.token)) {
      return res.json(apiError(UNAUTHORIZED));
    }
    next();
  };
};

function checkType(type, variable) {
  if (type === 'objectId') {
    return mongoose.Types.ObjectId.isValid(variable);
  }
  return ((typeof variable) === type);
}
