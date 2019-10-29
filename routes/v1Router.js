const express = require('express');
const router = express.Router();

router.use('/users', require('./v1/usersRouter'));
router.use('/poems', require('./v1/poemsRouter'));

module.exports = router;
