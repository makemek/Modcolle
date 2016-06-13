'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const settings = require('../settings');

router.get('/', function (req, res) {
  res.sendFile(path.join(__SERVER_ROOT, 'views', 'index.html'));
});

module.exports = exports = router;