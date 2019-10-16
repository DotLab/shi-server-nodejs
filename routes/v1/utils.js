const {apiError, BAD_REQUEST} = require('../../controllers/utils');

exports.STRING = 'string';
exports.NUMBER = 'number';
exports.DATE = 'date';

exports.createTypeChecker = function(params) {
  return function(req, res, next) {
    for (let key in params) {
      // Key is optional or required
      if (key[0] === '-') {
        // Optional key exists or not exist
        if (req.body[key] === undefined) {
          continue;
        } else {
          key = key.slice(1);
          if (!checkType(params[key], req.body[key])) {
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


function checkType(type, variable) {
  return ((typeof variable) === type);
}
