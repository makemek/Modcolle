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

   retrieveLocalKancolleFile(res, worldImageUrl);
})

var onlyMp3AndSwf = /^.*\.(swf|mp3|png)$/i;
router.get(onlyMp3AndSwf, function(req, res) {
   retrieveLocalKancolleFile(res, path.join(req.baseUrl, req.path));
});

function retrieveLocalKancolleFile(res, path2file) {
   console.log('-------Request File-------');

   var file = path.resolve(path.join(__SERVER_ROOT, settings.KANCOLLE_BASE_DIR, path2file));
   console.log('Path: ' + file);

   res.sendFile(file, {}, function(error) {
      var fileNotFound = error && error.status === 404;
      if(fileNotFound) {
         console.log(path.basename(file) + ' not found. Retrive from Kancolle server');
         retriveOnlineKancolleFile(res, path2file);
      }
   });
}

function retriveOnlineKancolleFile(res, path2file) {
   var onlineResourceUrl = kancolleExternal.kcsResource(path2file);
   console.log('Request external resource ' + onlineResourceUrl);
   res.redirect(onlineResourceUrl);
}

module.exports = exports = router;