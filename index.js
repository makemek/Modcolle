var path = require('path');
global.__SERVER_ROOT = path.resolve(__dirname);

var express = require('express');
var app = express();

app.use(function(req, res, next) {
   res.removeHeader('x-powered-by');
   next();
})

app.use('/', require('./routing/index'));
app.use('/', require('./routing/loopback'));
app.use('/kcsapi', require('./routing/kcsapi'));

app.listen(80, function() {
   console.log('Example app listening on port 80');
})

