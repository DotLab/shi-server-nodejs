const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const poetController = require('../../controllers/poetController');
const {createTypeChecker, STRING, NUMBER, OBJECT_ID} = require('./utils.js');

router.post('/', createTypeChecker({
  'filter': STRING,
  '-sort': STRING,
  '-order': STRING,
  'limit': NUMBER,
  'skip': NUMBER,
  '-activeYearLimit': NUMBER,
  '-search': STRING,
}), async (req, res) =>{
  const token = req.body.token;
  const filter = req.body.filter;
  const sort = req.body.sort;
  const limit = req.body.limit;
  const skip = req.body.skip;
  const order = req.body.order;
  const activeYearLimit = req.body.activeYearLimit;
  const search = (req.body.search === '' ? undefined : req.body.search);

  res.json(await poetController.listingQuery({
    token, filter, sort, order, limit, skip,
    activeYearLimit, search,
  }));
});

router.post('/poems', createTypeChecker({
  '-token': STRING,
  'poetId': OBJECT_ID,
}), async (req, res) => {
  const token = req.body.token;
  const poetId = req.body.poetId;

  res.json(await poetController.poems({
    token, poetId,
  }));
});

router.post('/detail', createTypeChecker({
  '-userName': STRING,
  '-userId': OBJECT_ID,
}), async (req, res) => {
  const userName = req.body.userName;
  const userId = req.body.userId;

  res.json(await poetController.detail({
    userName, userId,
  }));
});

router.post('/following', createTypeChecker({
  'userName': STRING,
}), async (req, res) => {
  const userName = req.body.userName;

  res.json(await poetController.following({
    userName,
  }));
});

router.post('/follower', createTypeChecker({
  'userName': STRING,
}), async (req, res) => {
  const userName = req.body.userName;

  res.json(await poetController.follower({
    userName,
  }));
});

router.post('/followingStatus', createTypeChecker({
  'token': STRING,
  'userIds': [OBJECT_ID],
}), async (req, res) => {
  const token = req.body.token;
  const userIds = req.body.userIds;

  res.json(await poetController.followStatus({
    token, userIds,
  }));
});

module.exports = router;
