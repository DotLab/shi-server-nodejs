const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

router.use('/users', require('./v1/usersRouter'));
router.use('/poems', require('./v1/poemsRouter'));

module.exports = router;
