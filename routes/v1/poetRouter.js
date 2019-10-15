const express = require('express');
const router = express.Router();
const poetController = require('../../controllers/poetController');


router.post('/', async (req, res) =>{
  const token = String(req.body.token);
  // order=desc&q=1&sort=alphabetical&year=1
  const q = String(req.query.q);
  const order = String(req.query.order);
  const sort = String(req.query.sort);
  const year = String(req.query.year);

  res.json(await poetController.listing({
    token, q, order, sort, year,
  }));
});


module.exports = router;
