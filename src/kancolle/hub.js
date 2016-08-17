'use strict';

const servers = require('./server/');
const Kancolle = require('./game');
const urljoin = require('url-join');

var Hub = {};

/**
 * Application id
 * @type {Number}
 */
Hub.appId = 854854;

/**
 * Request Kancolle server object
 * @param  {number} worldId - world id starting at 1. Checkout @link{http://kancolle.wikia.com/wiki/Servers|Server List} for more detail.
 * @return {object} server - a Kancolle server object
 * @throws {ReferenceError} If worldId doesn't match with any Kancolle server
 */
Hub.getServer = function(worldId) {
	const PREFIX = 'World_';
	const KEY = PREFIX + worldId;
	if(!servers[KEY])
		throw new ReferenceError(KEY + ' Kancolle ip lookup not found. Please make sure that mapping configuration world id to server is configured correctly');
	return servers[KEY];
}

/**
 * @typedef {Url}
 * @property {string} fileUrl - URL to swf file to launch the game
 */

/**
 * Start Kancolle
 * @param  {object}   gadgetInfo - gadget information containing player's id and security token issued by DMM
 * @return {Promise<Url>}
 */
Hub.launch = function(gadgetInfo) {
	return new Promise(function(resolve, reject) {
		var host = 'http://' + Kancolle.ENTRY_IP; 
		Kancolle.getWorldServerId(gadgetInfo, function(error, worldId) {
			var isNewPlayer = worldId == 0;
			if(error)
				return reject(error);
			if(isNewPlayer)
				return resolve(urljoin(host, 'kcs', 'world.swf'));
			else
				oldPlayer(worldId);
		})

		function oldPlayer(worldId) {
			var server = Hub.getServer(worldId);
			server.generateApiToken(gadgetInfo, function(error, isBan, token, starttime) {
				if(error)
					return reject(error);
				if(isBan)
					return resolve(urljoin(host, 'kcs', 'ban.swf'));
				return resolve(urljoin(host, 'kcs', 'mainD2.swf', '?api_token=' + token, '?api_starttime=' + starttime));
			})
		}
	})
}

module.exports = exports = Hub;