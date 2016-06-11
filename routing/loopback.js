/*
 * Handle Kancolle's request to external resources
 */

var express = require('express');
var router = express.Router();

var path = require('path');

var settings = require('../settings');
var kancolleExternal = require('../model/kancolleExternal')

router.get('/resources/image/world/:worldImg.png', function(req, res) {
   var host = new RegExp(req.headers.host, 'gi');
   var worldImageUrl = req.url.replace(host, settings.MY_WORLD_SERVER)
   .replace(/\./g, '_')
   .replace('_png', '.png');

   retrieveLocalKancolleFile(res, worldImageUrl, retriveOnlineKancolleFile(worldImageUrl));
})

var urlEndWithFileType = /^.*\.(swf|mp3|png)$/i;
router.get(urlEndWithFileType, function(req, res) {
   retrieveLocalKancolleFile(res, path.join(req.baseUrl, req.path), retriveOnlineKancolleFile(req.originalUrl));
});

function retrieveLocalKancolleFile(res, path2file, onFileNotFound) {
   console.log('-------Request File-------');

   var file = path.resolve(path.join(__SERVER_ROOT, settings.KANCOLLE_BASE_DIR, path2file));
   console.log('Path: ' + file);

   res.sendFile(file, {}, function(error) {
      var fileNotFound = error && error.status === 404;
      if(fileNotFound) {
         console.log(path.basename(file) + ' not found. Retrive from Kancolle server');
         onFileNotFound(res);
      }
   });
}

function retriveOnlineKancolleFile(kcsUrl) {
   return function(res) {
      var onlineResourceUrl = kancolleExternal.kcsResource(kcsUrl);
      console.log('Request external resource ' + onlineResourceUrl);
      res.redirect(onlineResourceUrl);
   }
}

module.exports = exports = router;