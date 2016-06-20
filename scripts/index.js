'use strict';

const throng = require('throng');
const server = require('./server');
const winston = require('winston');

var multiCoreInit = throng({
	master: startMaster,
	start: startWorker
})

function startMaster() {
	winston.info('Initialize multi-core');
}

function startWorker(id) {

	winston.info(`Start worker id ${id}`);
	server(80);

	process.on('SIGTERM', function() {
		winston.info(`Terminate worker id ${id}`);
		process.exit();
	})
}

module.exports = exports = multiCoreInit;
