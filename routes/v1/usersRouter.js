const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const {createTypeChecker, checkToken, STRING} = require('./utils.js');

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
}), checkToken()
, async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const token = req.body.token;

  res.json(await userController.changePassword({
    currentPassword, newPassword, token,
  }));
});

module.exports = router;
