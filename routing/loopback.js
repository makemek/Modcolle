/*
 * Handle Kancolle's request to external resources
 */

var express = require('express');
var router = express.Router();

var path = require('path');
var mime = require('mime');

var settings = require('../settings');

var onlyMp3AndSwf = /^.*\.(swf|mp3)$/i;

router.get(onlyMp3AndSwf, function(req, res) {
   console.log('-------Request File-------');
   console.log('URL: ' + req.url);

   var file = path.join(__SERVER_ROOT, settings.KANCOLLE_BASE_DIR, req.baseUrl, req.path);
   var filename = path.basename(file);

   var mimetype = mime.lookup(file);
   console.log('Mimetype: ' + mimetype);

   res.setHeader('Content-Type', mimetype);
   res.sendFile(file);
});

module.exports = exports = router;