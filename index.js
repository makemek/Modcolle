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

app.get('/mainD2.swf', function(req, res) {
   res.sendFile(path.join(__dirname, 'mainD2.swf'))
})

app.get('/crossdomain.xml', function(req, res) {
   res.sendFile(path.join(__dirname, 'crossdomain.xml'))
})

var downloadSWF = function(req, res) {
   console.log('-------Request File-------');
   console.log(req.params);
   console.log(req.query);

   var file = path.join(__dirname, req.params.file);
   var filename = path.basename(file);
   var mimetype = mime.lookup(file);

   console.log(filename);
   console.log(mimetype);

   res.setHeader('Content-Type', mimetype);
   res.sendFile(file)
}

app.get('/:file', downloadSWF);
app.get('/scenes/:file', downloadSWF);
app.get('/resources/swf/:file', downloadSWF);

app.listen(80, function() {
   console.log('Example app listening on port 80');
})