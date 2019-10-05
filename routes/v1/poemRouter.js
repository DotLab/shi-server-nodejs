const express = require('express');
const router = express.Router();
const poemController = require('../../controllers/poemController');

router.post('/create', async (req, res) => {
  const token = String(req.body.token);
  const title = String(req.body.title);
  const body = String(req.body.body);
  const date = new Date();
  const privacy = String(req.body.privacy);

  // for debug purpose
  // const author = String(req.body.author);


  res.json(await poemController.create({
    token, title, body, date, privacy,
  }));
});


module.exports = router;
