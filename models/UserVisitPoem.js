const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('UserVisitPoem', {
  user: ObjectId,
  poem: ObjectId,
});
