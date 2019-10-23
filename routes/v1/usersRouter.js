const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const {createTypeChecker, createTokenChecker, STRING, OBJECT_ID} = require('./utils.js');

router.post('/register', createTypeChecker({
  'userName': STRING,
  'email': STRING,
  'displayName': STRING,
  'password': STRING,
}), async (req, res) => {
  const userName = req.body.userName;
  const email = req.body.email;
  const displayName = req.body.displayName;
  const password = req.body.password;

  res.json(await userController.register({
    userName, email, displayName, password,
  }));
});

router.post('/login', createTypeChecker({
  'email': STRING,
  'password': STRING,
}), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  res.json(await userController.login({
    email, password,
  }));
});

router.post('/settings/password/change', createTypeChecker({
  'token': STRING,
  'currentPassword': STRING,
  'newPassword': STRING,
}), createTokenChecker(), async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const token = req.body.token;

  res.json(await userController.changePassword({
    currentPassword, newPassword, token,
  }));
});

router.post('/follow', createTypeChecker({
  'token': STRING,
  'followId': OBJECT_ID,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const followId = req.body.followId;

  res.json(await userController.follow({
    token, followId,
  }));
});

router.post('/unfollow', createTypeChecker({
  'token': STRING,
  'unfollowId': OBJECT_ID,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;
  const unfollowId = req.body.unfollowId;

  res.json(await userController.unfollow({
    token, unfollowId,
  }));
});

router.post('/detail', createTypeChecker({
  'token': STRING,
}), createTokenChecker(), async (req, res) => {
  const token = req.body.token;

  res.json(await userController.detail({
    token,
  }));
});

module.exports = router;
