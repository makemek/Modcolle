'use strict';

/**
 * Handle Kancolle requests to external resources
 **/

var express = require('express');
var router = express.Router();
var path = require('path');
const validator = require('validator');

var settings = require('nconf');
var kancolleExternal = require('../kancolle/external');
var agent = require('../kancolle/agent');
const appLog = require('winston').loggers.get('app')
const expressLog = require('winston').loggers.get('express');


/**
 * Handle http GET request to server flag image
 * First, it will look file in a directory reflected by its uri
 * If file is not found, it will request the file from kancolle server
 *
 * When kancolle request for server image
 * It requests the following format http://<server>/resources/image/world/<world>_t.png
 * <server> is the player's server host name or ip address
 * <world> is a file name generated from <server> string
 *
 * If <server> is an ip address, <world> replace '.' with '_' and include 3 zerofills.
 * For example, 1.1.11.111 will be 001_001_011_111, 1.2.3.4 will be 001_002_003_004
 * If <server> is a host name, <world> replace '.' with '_' only
 * For example, www.example.com becomes www_example_com
 **/
router.get('/resources/image/world/:worldImg.png', function(req, res, next) {
   expressLog.info('GET: ' + req.originalUrl);

   var imageName = path.basename(req.params.worldImg, '_t');
   var host = req.headers.host;

   appLog.info('convert image name ' + imageName + '_t.png' + ' to acceptable format with target server ' + settings.get('MY_WORLD_SERVER'));
   var worldServerImageName = convertToWorldImageFilename(imageName, settings.get('MY_WORLD_SERVER'));
   var worldImageUrl = req.url.replace(imageName, worldServerImageName);

   appLog.debug('Image name: ' + imageName);
   appLog.debug('Host name: ' + host);
   appLog.debug('World image filename: ' + worldServerImageName);
   appLog.debug('World image URL: ' + worldImageUrl);

   agent.load(res, worldImageUrl, handleFileNotFound(worldImageUrl, res, next));
})


/**
 * Handle any http GET for any file that have the extension of swf, mp3, or png
 * First, it will look file in a directory reflected by its uri
 * If file is not found, it will request the file from kancolle server
 **/
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
         });
      }
      else if(error) {
         appLog.error(error);
         return next(error);
      }
   }
}

function convertToWorldImageFilename(imageName, worldServerIp) {
   var isIpAddress = validator.isIP(imageName.split('_').map(Number).join('.'));
   var worldServerImageName;
   if(isIpAddress) {
      var ip = worldServerIp.split('.');
      appLog.verbose('include 3 zerofills');
      appLog.debug(ip);
      for(var n = 0; n < ip.length; ++n)
         ip[n] = ("000" + ip[n]).substr(-3,3);

      appLog.debug(ip);
      worldServerImageName = ip.join('_');
   }
   else {
      appLog.verbose(imageName + ' is not an ip address, treated as host name');
      appLog.verbose("replace '_' with '.'");
      worldServerImageName = imageName.replace(/\./g, '_');
   }

   return worldServerImageName;
}

module.exports = exports = router;