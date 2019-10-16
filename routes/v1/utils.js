const {apiError} = require('../../controllers/utils');

exports.STRING = 'string';
exports.NUMBER = 'number';
exports.DATE = 'date';


exports.createTypeChecker = function(params) {
  return function(req, res, next) {
    for (const key in params) {
      if (key[0] === '-' && req.body[key] === undefined) {
        continue;
      }
      if (!checkType(params[key], req.body[key])) {
        return res.json(apiError('Fail'));
      }
    }
    next();
  };
};


function checkType(type, variable) {
  if ((typeof variable) === type) {
    return true;
  }
  return false;
}
