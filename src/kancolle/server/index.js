'use strict';

const KcServer = require('./server');
const ACCESS_KEY = 'KANCOLLE_SERVER_';
var servers = {};

for(let worldId = 1; process.env.hasOwnProperty(ACCESS_KEY + worldId); ++worldId) {
	let host = process.env[ACCESS_KEY + worldId];
	servers[worldId] = new KcServer(host);
}

module.exports = exports = servers;