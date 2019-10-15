const express = require('express');
const router = express.Router();

router.use('/users', require('./v1/usersRouter'));
router.use('/poem', require('./v1/poemRouter'));
router.use('/poet', require('./v1/poetRouter'));
router.use('/', require('./v1/indexRouter'));


module.exports = router;
