'use strict';

const nconf = require('nconf');
const winston = require('winston');
loadConfig();

const App = require('./modcolle');

function startServer(port) {
	var modColle = new App(port);
	modColle.start(function() {
		winston.loggers.get('app').info('ModColle is ready!');
	})
}

function loadConfig() {
	nconf.argv().env();
	nconf.add('settings', {type: 'file', file: 'scripts/config/settings.json'});
	nconf.add('logger', {type: 'file', file: 'scripts/config/loggerSettings.json'});

	setupLogger();
}

function setupLogger() {
	var loggerConfig = nconf.get('logger');
	Object.keys(loggerConfig).forEach(function(key) {
	    winston.loggers.add(key, loggerConfig[key]);
	});
}

module.exports = exports = startServer(80);
