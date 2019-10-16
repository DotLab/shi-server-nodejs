const {apiError, BAD_REQUEST} = require('../../controllers/utils');

exports.STRING = 'string';
exports.NUMBER = 'number';
exports.DATE = 'date';

exports.createTypeChecker = function(params) {
  return function(req, res, next) {
    for (const key in params) {
      // Key is optional or required
      if (key[0] === '-') {
        // Optional key does not exists or exists
        if (req.body[key.slice(1)] === undefined) {
          continue;
        } else {
          if (!checkType(params[key], req.body[key.slice(1)])) {
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
