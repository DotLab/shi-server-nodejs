const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

router.post('/register', async (req, res) => {
  const userName = String(req.body.userName);
  const email = String(req.body.email);
  const displayName = String(req.body.displayName);
  const password = String(req.body.password);

  res.json(await userController.register({
    userName, email, displayName, password,
  }));
});

router.post('/login', async (req, res) => {
  const email = String(req.body.email);
  const password = String(req.body.password);

  res.json(await userController.login({
    email, password,
  }));
});


router.post('/settings/password/change', async (req, res) => {
  const currentPassword = String(req.body.currentPassword);
  const newPassword = String(req.body.newPassword);
  const token = String(req.body.token);

  res.json(await userController.changePassword({
    currentPassword, newPassword, token,
  }));
});


router.post('/follow', async (req, res) => {
  const token = String(req.body.token);
  const followId = String(req.body.followId);

  res.json(await userController.follow({
    token, followId,
  }));
});

router.post('/unfollow', async (req, res) => {
  const token = String(req.body.token);
  const unfollowId = String(req.body.unfollowId);

  res.json(await userController.unfollow({
    token, unfollowId,
  }));
});

module.exports = router;
