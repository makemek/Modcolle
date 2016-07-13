'use strict';
/*
 * Handle Kancolle's request to external resources
 */
var express = require('express');
var router = express.Router();
var path = require('path');
const validator = require('validator');

var settings = require('nconf');
var kancolleExternal = require('../kancolle/external');
var agent = require('../kancolle/agent');
const appLog = require('winston').loggers.get('app')
const expressLog = require('winston').loggers.get('express');

router.get('/resources/image/world/:worldImg.png', function(req, res, next) {
   expressLog.info('GET: ' + req.originalUrl);

   var imageName = req.params.worldImg.replace('_t', '');
   var worldServerImageName = convertToWorldImageFilename(imageName, req.headers.host, settings.get('MY_WORLD_SERVER'));
   var worldImageUrl = req.url.replace(imageName, worldServerImageName);

   appLog.debug('Image name: ' + req.params.worldImg);
   appLog.debug('Host name: ' + req.headers.host);
   appLog.debug('World image filename: ' + worldServerImageName);
   appLog.debug('World image URL: ' + worldImageUrl);

   agent.load(res, worldImageUrl, handleFileNotFound(worldImageUrl, res, next));
})

var urlEndWithFileType = /^.*\.(swf|mp3|png)$/i;
router.get(urlEndWithFileType, function(req, res, next) {
   expressLog.info('GET: ' + req.originalUrl);
   var path2file = path.join(req.baseUrl, req.path);

   agent.load(res, path2file, handleFileNotFound(req.originalUrl, res, next));
});

function handleFileNotFound(urlDownload, res, next) {
   return function(error) {
      var fileNotFound = error && error.status === 404;
      if(fileNotFound) {
         var resource = kancolleExternal.kcsResource(urlDownload);
         appLog.info('File not found or not cached');
         appLog.info('Get resource from: ' + resource);
         return agent.download(res, resource, function(response) {
            if(response.statusCode != 200) {
               appLog.error(error);
               return next(error);
            }
            appLog.info('Download Completed');
            appLog.info('Source URL: ' + resource);
            appLog.debug('Return status code: ' + response.statusCode);
            appLog.debug('Response header: ' + response.headers);
         });
      }
      else if(error) {
         appLog.error(error);
         return next(error);
      }
   }
}

function convertToWorldImageFilename(imageName, thisHostName, worldServerIp) {
   var isHostName = imageName == thisHostName;
   var isIpAddress = validator.isIP(imageName.split('_').map(Number).join('.'));
   var worldServerImageName;
   if(isHostName || isIpAddress) {
      var ip = worldServerIp.split('.');
      for(var n = 0; n < ip.length; ++n)
         ip[n] = ("000" + ip[n]).substr(-3,3);

      worldServerImageName = ip.join('_');
   }
   else {
      appLog.warn(imageName + ' is neither a host name nor ip address');
      worldServerImageName = imageName;
   }

   return worldServerImageName;
}

module.exports = exports = router;