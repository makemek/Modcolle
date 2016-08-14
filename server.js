'use strict';

const nconf = require('nconf');
const winston = require('winston');
loadConfig();
setupLogger();
const modcolle = require('./src/');

function startServer(port) {
	modcolle.listen(port, function() {
		winston.loggers.get('app').info('ModColle is ready!');
	})
}

function loadConfig() {
	nconf.argv().env();
	nconf.add('settings', {type: 'file', file: 'src/config/settings.json'});
	nconf.add('logger', {type: 'file', file: 'src/config/loggerSettings.json'});
}

function setupLogger() {
	var loggerConfig = nconf.get('logger');
	Object.keys(loggerConfig).forEach(function(key) {
	    winston.loggers.add(key, loggerConfig[key]);
	});
}

module.exports = exports = startServer(80);
