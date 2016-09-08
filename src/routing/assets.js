'use strict';

/**
 * Handle Kancolle requests to external resources
 **/

var express = require('express');
var router = express.Router();
var path = require('path');
const validator = require('validator');
const urljoin = require('url-join');
const kancolle = require('../kancolle/');
const appLog = require('winston').loggers.get('app');
const request = require('request');

/**
 * Handle http GET request to server flag image
 * First, it will look file in a directory reflected by its uri
 * If file is not found, it will request the file from kancolle server
 *
 * When kancolle request for server image
 * It requests the following format http://<server>/kcs/resources/image/world/<world>_t.png
 * <server> is the player's server host name or ip address
 * <world> is a file name generated from <server> string
 *
 * If <server> is an ip address, <world> replace '.' with '_' and include 3 zerofills.
 * For example, 1.1.11.111 will be 001_001_011_111, 1.2.3.4 will be 001_002_003_004
 * If <server> is a host name, <world> replace '.' with '_' only
 * For example, www.example.com becomes www_example_com
 **/
const WOLRD_IMG_URL = 'kcs/resources/image/world'
router.get('/' + WOLRD_IMG_URL + '/:worldImg', function(req, res, next) {
   appLog.info('convert image name ' + req.params.worldImg + ' to acceptable format');

   var host = getHost(req.params.worldImg);
   var targetServer = kancolle.getServer(host);
   if(!targetServer) {
      appLog.info(host + ' does not exist in any kancolle server host name');
      return res.sendStatus(400);
   }

   //TODO try loading from disk before downloading Kancolle server
   var url = urljoin(targetServer.host, WOLRD_IMG_URL, req.params.worldImg);
   appLog.info('donwload server image logo from ' + url);
   var proxyRequest = targetServer.download(url);
   registerProxyEvent(proxyRequest);
   proxyRequest.pipe(res);

   function getHost(worldImageFilename) {
      var host;
      var trailoutString = '_t.png';
      var basename = path.basename(worldImageFilename, trailoutString);
      appLog.debug('trail out ' + trailoutString, basename);

      var ipStrip = basename.split('_').map(Number).join('.');
      if(validator.isIP(ipStrip)) {
         host = ipStrip;
         appLog.verbose(worldImageFilename + 'is an ip address', host);
      }
      else {
         host = basename.split('_').join('.');
         appLog.verbose(worldImageFilename + 'is a hostname', host);
      }

      return host;
   }

   function registerProxyEvent(proxyRequest) {
      proxyRequest.on('error', next)
      proxyRequest.on('response', () => {
         appLog.info('connected to ' + url);
      })
      proxyRequest.on('end', () => {
         appLog.info('terminate connection ' + url);
      })
      return proxyRequest;
   }
})


/**
 * Handle any http GET for any file that have the extension of swf, mp3, or png
 * First, it will look file in a directory reflected by its uri
 * If file is not found, it will request the file from kancolle server
 **/
var urlEndWithFileType = /^.*\.(swf|mp3|png)$/i;
router.get(urlEndWithFileType, function(req, res, next) {
   var agent = new Agent(MY_WORLD_SERVER);
   var path2file = path.join(req.baseUrl, req.path);
   
   Agent.load(res, path2file, handleFileNotFound(agent, req.originalUrl, res, next));
});

function handleFileNotFound(agent, urlDownload, res, next) {
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

module.exports = exports = router;