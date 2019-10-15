const express = require('express');
const router = express.Router();
const poemController = require('../../controllers/poemController');

router.post('/', async (req, res) => {
  const token = String(req.body.token);

  res.json(await poemController.listing(
      token,
  ));
});


module.exports = router;
