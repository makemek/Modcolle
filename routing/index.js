var express = require('express');
var router = express.Router();
var path = require('path');
var settings = require('../settings');

router.get('/', function (req, res) {
  res.sendFile(path.join(__SERVER_ROOT, 'views', 'index.html'));
});

module.exports = exports = router;