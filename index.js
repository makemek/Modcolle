var express = require('express');
var path = require('path');
var mime = require('mime');

var app = express();

app.use(function(req, res, next) {
   res.removeHeader('x-powered-by');
   next();
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// URIs where Kancolle make a request to external resources
app.get('/:file', sendStaticFile());
app.get('/scenes/:file', sendStaticFile());
app.get('/resources/swf/:file', sendStaticFile());

app.listen(80, function() {
   console.log('Example app listening on port 80');
})

function sendStaticFile() {

   return function(req, res) {
      console.log('-------Request File-------');
      console.log('Filename: ' + req.params.file);
      console.log('Parameters: ' + JSON.stringify(req.query));

      var file = path.join(__dirname, req.baseUrl, req.path);
      var filename = path.basename(file);

      var mimetype = mime.lookup(file);
      console.log('Mimetype: ' + mimetype);


      res.setHeader('Content-Type', mimetype);
      res.sendFile(file)
   }
}
