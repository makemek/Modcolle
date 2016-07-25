'use strict';

const inherit = require('inherit');
const express = require('express');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const nconf = require('nconf');
const winston = require('winston');

const router = require('./routing/');

var Application = {

	__constructor: function() {
		this.app = express();
		
		setupMiddleware(this.app);
		setupTemplateEngine(this.app);
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
	app.use('/', router);
}

function setupMiddleware(app) {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
}

function setupTemplateEngine(app) {
	var engineName = 'hbs';
	var templateExtension = 'hbs';
	var baseDirView = 'src/views';

	var options = {
		defaultLayout: 'defaultLayout', 
		extname: templateExtension,

		layoutsDir: baseDirView + '/layouts',
		partialsDir: baseDirView + '/partials'
	}
	var hbs = expressHandlebars.create(options);

	app.engine(engineName, hbs.engine);
	app.set('views', baseDirView);
	app.set('view engine', engineName);
}



module.exports = exports = inherit(Application);