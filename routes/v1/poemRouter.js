const express = require('express');
const router = express.Router();
const poemController = require('../../controllers/poemController');

router.post('/create', async (req, res) => {
  const token = String(req.body.token);
  const title = String(req.body.title);
  const body = String(req.body.body);
  const date = new Date();
  const privacy = String(req.body.privacy);

  res.json(await poemController.create({
    token, title, body, date, privacy,
  }));
});

router.post('/edit', async (req, res) => {
  const token = String(req.body.token);
  const poemId = String(req.body.poemId);
  const title = String(req.body.title);
  const body = String(req.body.body);
  const date = new Date();
  const privacy = String(req.body.privacy);

  res.json(await poemController.edit({
    token, poemId, title, body, date, privacy,
  }));
});

router.post('/delete', async (req, res) => {
  const token = String(req.body.token);
  const poemId = String(req.body.poemId);

  res.json(await poemController.delete({
    token, poemId,
  }));
});

router.post('/like', async (req, res) => {
  const token = String(req.body.token);
  const poemId = String(req.body.poemId);

  res.json(await poemController.like({
    token, poemId,
  }));
});


router.post('/unlike', async (req, res) => {
  const token = String(req.body.token);
  const poemId = String(req.body.poemId);

  res.json(await poemController.unlike({
    token, poemId,
  }));
});
module.exports = router;


router.post('/comment', async (req, res) => {
  const token = String(req.body.token);
  const poemId = String(req.body.poemId);
  const comment = String(req.body.comment);
  const date = new Date();

  res.json(await poemController.comment({
    token, poemId, comment, date,
  }));
})
;
