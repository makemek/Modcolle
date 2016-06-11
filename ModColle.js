'use strict'
var inherit = require('inherit');
var express = require('express');

var Application = {

	__constructor: function() {
		this.app = express();

		setupDefaultLocalResponseHeader(this.app);
		setupRouting(this.app);
	},

	start: function(port, afterStart) {
		this.app.listen(port, afterStart);
	}
}

function setupDefaultLocalResponseHeader(app) {
	app.use(function(req, res, next) {
	   res.set('X-Powered-By', 'ModColle');
	   next();
	});
}

function setupRouting(app) {
	app.use('/', require('./routing/index'));
	app.use('/', require('./routing/loopback'));
	app.use('/kcsapi', require('./routing/kcsapi'));
}


module.exports = exports = inherit(Application);