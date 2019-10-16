const express = require('express');
const poetsController = require('../../controllers/poetController');
const {checkType, apiError} = require('../../controllers/utils');
const {STRING, NUMBER} = require('../../controllers/utils');
const router = express.Router();


router.post('/', async (req, res) =>{
  const token = String(req.body.token);

  const filter = req.body.filter;
  if (filter != undefined && !checkType(STRING, filter)) {
    return res.json(apiError('Fail'));
  }

  const sort = req.body.sort;
  if (sort != undefined && !checkType(STRING, sort)) {
    return res.json(apiError('Fail'));
  }

  const order = req.body.order;
  if (order != undefined && !checkType(STRING, order)) {
    return res.json(apiError('Fail'));
  }

  const skip = req.body.skip;
  if (skip === undefined || !checkType(NUMBER, skip)) {
    return res.json(apiError('Fail'));
  }

  const limit = req.body.limit;
  if (limit === undefined || !checkType(NUMBER, limit)) {
    return res.json(apiError('Fail'));
  }

  const search = req.body.search;
  if (search != undefined && !checkType(STRING, search)) {
    return res.json(apiError('Fail'));
  }

  const activeYearLimit = req.body.activeYearLimit;
  if (activeYearLimit != undefined && !checkType(NUMBER, activeYearLimit)) {
    return res.json(apiError('Fail'));
  }

  res.json(await poetsController.listingQuery({
    token, filter, sort, limit, skip, order,
    activeYearLimit, search,
  }));
});


module.exports = router;
