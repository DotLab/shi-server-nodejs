const express = require('express');
const router = express.Router();

router.use('/users', require('./v1/usersRouter'));
router.use('/poems', require('./v1/poemsRouter'));
router.use('/poets', require('./v1/poetsRouter'));

module.exports = router;
