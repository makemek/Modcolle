'use strict';
/*
 * Handle Kancolle's request to external resources
 */
var express = require('express');
var router = express.Router();
var path = require('path');

var settings = require('nconf');
var kancolleExternal = require('../model/kancolleExternal');
var agent = require('../model/agent');

router.get('/resources/image/world/:worldImg.png', function(req, res, next) {
   var host = new RegExp(req.headers.host, 'gi');
   var worldImageUrl = req.url.replace(host, settings.get('MY_WORLD_SERVER'))
   .replace(/\./g, '_')
   .replace('_png', '.png');

   agent.load(res, worldImageUrl, handleFileNotFound(worldImageUrl, res, next));
})

var urlEndWithFileType = /^.*\.(swf|mp3|png)$/i;
router.get(urlEndWithFileType, function(req, res, next) {
   var path2file = path.join(req.baseUrl, req.path);

   agent.load(res, path2file, handleFileNotFound(req.originalUrl, res, next));
});

function handleFileNotFound(urlDownload, res, next) {
   return function(error) {
      var fileNotFound = error && error.status === 404;
      if(fileNotFound) {
         var resource = kancolleExternal.kcsResource(urlDownload);
         console.log('File not found or not cached. Request resource from Kancolle server');
         console.log('URL: ' + resource);
         return agent.download(res, resource);
      }
      else {
         return next(error);
      }
   }
}

module.exports = exports = router;