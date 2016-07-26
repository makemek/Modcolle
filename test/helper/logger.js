'use strict';

const app = require('../../src/modcolle');
const winston = require('winston');

var loggers = winston.loggers.loggers;

Object.keys(loggers).forEach(function(loggerName) {
	var logger = winston.loggers.get(loggerName);
	logger.remove(winston.transports.Console);
	logger.add(winston.transports.Console, {
		label: loggerName,
		level: 'debug',
		prettyPrint: true,
		colorize: true,
		silent: true // set this to false to show log message to the console
	})
})
