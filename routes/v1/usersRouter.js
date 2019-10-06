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

module.exports = router;
