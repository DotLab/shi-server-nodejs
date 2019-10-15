const express = require('express');
const router = express.Router();

router.use('/users', require('./v1/usersRouter'));
router.use('/poem', require('./v1/poemRouter'));

module.exports = router;
