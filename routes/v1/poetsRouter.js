const express = require('express');
const poetController = require('../../controllers/poetController');
const {createTypeChecker, STRING, NUMBER, OBJECT_ID} = require('./utils.js');
const router = express.Router();

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
  'targetUser': OBJECT_ID,
}), async (req, res) => {
  const token = req.body.token;
  const targetUser = req.body.targetUser;

  res.json(await poetController.poems({
    token, targetUser,
  }));
});

module.exports = router;
