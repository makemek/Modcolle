'use strict';

const path = require('path');
global.__SERVER_ROOT = path.resolve(__dirname);

const App = require('./ModColle');
const winston = require('winston');

var modColle = new App();
modColle.start(80, function() {
	winston.loggers.get('app').info('ModColle is ready!');
})

