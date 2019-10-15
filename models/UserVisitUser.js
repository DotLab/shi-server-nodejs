const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('UserVisitUser', {
  user: ObjectId,
  visited: ObjectId,
});
