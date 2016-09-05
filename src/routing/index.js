'use strict';

const express = require('express');
const router = express.Router();

router.use('/', require('./game'));
router.use('/', require('./assets'));
router.use('/kcsapi', require('./kcsapi/'));

module.exports = exports = router;
