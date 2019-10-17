const express = require('express');
const router = express.Router();
const poemController = require('../../controllers/poemController');
const {createTypeChecker, checkToken, STRING, OBJECT_ID} = require('./utils.js');

router.post('/create', createTypeChecker({
  'token': STRING,
  'title': STRING,
  'body': STRING,
  'privacy': STRING,
}), checkToken()
, async (req, res) => {
  const token = req.body.token;
  const title = req.body.title;
  const body = req.body.body;
  const privacy = req.body.privacy;
  const date = new Date();

  res.json(await poemController.create({
    token, title, body, date, privacy,
  }));
});

router.post('/edit', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
  'title': STRING,
  'body': STRING,
  'privacy': STRING,
}), checkToken()
, async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;
  const title = req.body.title;
  const body = req.body.body;
  const privacy = req.body.privacy;
  const date = new Date();

  res.json(await poemController.edit({
    token, poemId, title, body, date, privacy,
  }));
});

router.post('/delete', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
}), checkToken()
, async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.delete({
    token, poemId,
  }));
});

router.post('/like', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
}), checkToken()
, async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.like({
    token, poemId,
  }));
});

router.post('/unlike', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
}), checkToken()
, async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.unlike({
    token, poemId,
  }));
});

router.post('/visit', createTypeChecker({
  '-token': STRING,
  'poemId': OBJECT_ID,
})
, async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.visit({
    token, poemId,
  }));
});

router.post('/comment', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
  'comment': STRING,

}), checkToken()
, async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;
  const comment = req.body.comment;
  const date = new Date();

  res.json(await poemController.comment({
    token, poemId, comment, date,
  }));
});

router.post('/comment/delete', createTypeChecker({
  'token': STRING,
  'commentId': OBJECT_ID,
}), checkToken()
, async (req, res) => {
  const token = req.body.token;
  const commentId = req.body.commentId;

  res.json(await poemController.commentDelete({
    token, commentId,
  }));
});

module.exports = router;
