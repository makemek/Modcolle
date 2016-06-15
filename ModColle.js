'use strict';

const inherit = require('inherit');
const express = require('express');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const nconf = require('nconf');
const winston = require('winston');

var Application = {

	__constructor: function() {
		this.app = express();
		
		loadConfig();
		setupLogger();
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
	app.use('/', require('./routing/index'));
	app.use('/', require('./routing/loopback'));
	app.use('/kcsapi', require('./routing/kcsapi'));
}

function setupMiddleware(app) {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
}

function setupTemplateEngine(app) {
	var engineName = 'hbs';
	var templateExtension = 'hbs';

	var options = {
		defaultLayout: 'defaultLayout', 
		extname: templateExtension,

		layoutDir: 'views/layout',
		partialsDir: 'views/partial'
	}
	var hbs = expressHandlebars.create(options);

	app.engine(engineName, hbs.engine);
	app.set('view engine', engineName);
}

function loadConfig() {
	nconf.argv().env();
	nconf.add('settings', {type: 'file', file: 'settings.json'});
	nconf.add('logger', {type: 'file', file: 'loggerSettings.json'});
}

function setupLogger() {
	var loggerConfig = nconf.get('logger');
	Object.keys(loggerConfig).forEach(function(key) {
	    winston.loggers.add(key, loggerConfig[key]);
	});
}

module.exports = exports = inherit(Application);