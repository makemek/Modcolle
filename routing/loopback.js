var express = require('express');
var router = express.Router();

var path = require('path');
var mime = require('mime');

var settings = require('../settings');

// URIs where Kancolle makes a request to external resources
router.get('/:file', sendStaticFile());
router.get('/scenes/:file', sendStaticFile());
router.get('/resources/swf/:file', sendStaticFile());

function sendStaticFile() {

   return function(req, res) {
      console.log('-------Request File-------');
      console.log('Filename: ' + req.params.file);
      console.log('Parameters: ' + JSON.stringify(req.query));

      var file = path.join(__SERVER_ROOT, settings.KANCOLLE_BASE_DIR, req.baseUrl, req.path);
      var filename = path.basename(file);

      var mimetype = mime.lookup(file);
      console.log('Mimetype: ' + mimetype);


      res.setHeader('Content-Type', mimetype);
      res.sendFile(file)
   }
}

module.exports = exports = router;