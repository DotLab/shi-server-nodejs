const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('UserLikePoem', {
  user: ObjectId,
  poem: ObjectId,
});
