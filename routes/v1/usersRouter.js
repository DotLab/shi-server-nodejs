const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const {createTypeChecker, STRING} = require('./utils.js');

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


module.exports = router;
