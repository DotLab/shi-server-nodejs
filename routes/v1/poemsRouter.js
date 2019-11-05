const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const poemController = require('../../controllers/poemController');
const {createTypeChecker, createTokenChecker, STRING, OBJECT_ID, NUMBER} = require('./utils.js');

router.post('/create', createTypeChecker({
  'token': STRING,
  'title': STRING,
  'body': STRING,
  'visibility': STRING,
  'align': STRING,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const title = req.body.title;
  const body = req.body.body;
  const visibility = req.body.visibility;
  const align = req.body.align;
  const date = new Date();

  res.json(await poemController.create({
    token, title, body, date, visibility, align,
  }));
});

router.post('/edit', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
  'title': STRING,
  'body': STRING,
  'visibility': STRING,
  'align': STRING,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;
  const title = req.body.title;
  const body = req.body.body;
  const visibility = req.body.visibility;
  const align = req.body.align;
  const date = new Date();

  res.json(await poemController.edit({
    token, poemId, title, body, date, visibility, align,
  }));
});

router.post('/delete', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.delete({
    token, poemId,
  }));
});

router.post('/like', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.like({
    token, poemId,
  }));
});

router.post('/unlike', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.unlike({
    token, poemId,
  }));
});

router.post('/visit', createTypeChecker({
  '-token': STRING,
  'poemId': OBJECT_ID,
}), async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.visit({
    token, poemId,
  }));
});

router.post('/detail', createTypeChecker({
  '-token': STRING,
  'poemId': OBJECT_ID,
}), async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.detail({
    token, poemId,
  }));
});

router.post('/comment', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
  'comment': STRING,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;
  const comment = req.body.comment;
  const date = new Date();

  res.json(await poemController.createComment({
    token, poemId, comment, date,
  }));
});

router.post('/comment/delete', createTypeChecker({
  'token': STRING,
  'commentId': OBJECT_ID,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const commentId = req.body.commentId;

  res.json(await poemController.deleteComment({
    token, commentId,
  }));
});

router.post('/likeStatus', createTypeChecker({
  'token': STRING,
  'poemIds': [OBJECT_ID],
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const poemIds = req.body.poemIds;

  res.json(await poemController.likeStatus({
    token, poemIds,
  }));
});

router.post('/home', createTypeChecker({
  'filter': STRING,
  '-sort': STRING,
  '-order': STRING,
  'limit': NUMBER,
  'skip': NUMBER,
  '-search': STRING,
}), async (req, res) => {
  const token = req.body.token;
  const filter = req.body.filter;
  const sort = req.body.sort;
  const limit = req.body.limit;
  const skip = req.body.skip;
  const order = req.body.order;
  const search = (req.body.search === '' ? undefined : req.body.search);

  res.json(await poemController.listingQuery({
    token, filter, sort, order, limit, skip,
    search,
  }));
});

router.post('/comment-list', createTypeChecker({
  'token': STRING,
  'poemId': OBJECT_ID,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const poemId = req.body.poemId;

  res.json(await poemController.commentList({
    token, poemId,
  }));
});

module.exports = router;
