'use strict';

const App = require('./ModColle');
const winston = require('winston');

function startServer(port) {
	var modColle = new App(port);
	modColle.start(function() {
		winston.loggers.get('app').info('ModColle is ready!');
	})
}

module.exports = exports = startServer(80);
