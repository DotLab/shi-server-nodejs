const express = require('express');
const router = express.Router();

router.use('/users', require('./v1/userRouter'));
router.use('/poems', require('./v1/poemRouter'));
router.use('/poets', require('./v1/poetRouter'));
router.use('/', require('./v1/indexRouter'));

module.exports = router;
