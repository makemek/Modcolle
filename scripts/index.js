'use strict';

const throng = require('throng');
const server = require('./server');

function forkWorker() {
	throng(function(workerId) {
		server(80);
	})
}

module.exports = exports = forkWorker();