'use strict';

const path = require('path');
global.__SERVER_ROOT = path.resolve(__dirname);

const App = require('./ModColle');

var modColle = new App();
modColle.start(80, function() {
	console.log('ModColle is ready!');
})

