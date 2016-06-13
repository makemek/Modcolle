'use strict';

const inherit = require('inherit');
const express = require('express');
const bodyParser = require('body-parser');

var Application = {

	__constructor: function() {
		this.app = express();

		setupMiddleware(this.app);
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

function setupMiddleware(app) {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
}

module.exports = exports = inherit(Application);