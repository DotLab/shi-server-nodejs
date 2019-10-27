const {apiError, BAD_REQUEST, UNAUTHORIZED} = require('../../controllers/utils');
const {checkTokenValid} = require('../../services/tokenService');
const mongoose = require('mongoose');

const STRING = 'string';
const NUMBER = 'number';
const DATE = 'date';
const OBJECT_ID = 'objectId';
const OBJECT = 'object';

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
        if (req.body[keySlice] === undefined || req.body[keySlice] === null) {
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

exports.createTokenChecker = function() {
  return function(req, res, next) {
    if (!checkTokenValid(req.body.token)) {
      return res.json(apiError(UNAUTHORIZED));
    }
    next();
  };
};

function checkType(type, value) {
  switch (type) {
    case STRING:
    case NUMBER:
    case DATE:
      return (typeof value) === type;
    case OBJECT_ID:
      return mongoose.Types.ObjectId.isValid(value);
    default:
      if (Array.isArray(type)) {
        // Should be an array.
        const genericType = type[0];
        return Array.isArray(value) && value.every((x) => checkType(genericType, x));
      } else if ((typeof type) === OBJECT) {
        // Should be an object.
        if ((typeof value) !== OBJECT) return false;

        const keys = Object.keys(type);
        const valueKeys = Object.keys(value);
        return keys.length === valueKeys.length && keys.every((x) => checkType(type[x], value[x]));
      }

      throw new Error('checkType: invalid type definition');
  }
}
