var express = require('express');
var path = require('path');
var app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/mainD2.swf', function(req, res) {
   res.sendFile(path.join(__dirname, 'mainD2.swf'))
})

var downloadSWF = function(req, res) {
   console.log('-------Request File-------');
   console.log(req.params);
   console.log(req.query);
   res.download(path.join(__dirname, req.params.file))
}

app.get('/:file', downloadSWF);
app.get('/scenes/:file', downloadSWF);

app.listen(80, function() {
   console.log('Example app listening on port 80');
})