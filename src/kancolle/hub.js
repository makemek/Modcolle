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
	if(!servers[worldId])
		throw new ReferenceError(`Not found ip address associated with world id ${worldId}. Please make sure that KANCOLLE_SERVER_${worldId} exist in environment variables`);
	return servers[worldId];
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
	return Kancolle.getWorldServerId(gadgetInfo)
	.then(worldId => {
		if(worldId == 0)
			return newPlayer();
		else
			return oldPlayer(worldId);
	})

	function newPlayer() {
		return Promise.resolve(urljoin(Kancolle.ENTRY_HOST, 'kcs', 'world.swf'));
	}

	function oldPlayer(worldId) {
		var server = Hub.getServer(worldId);
		return server.generateApiToken(gadgetInfo).then(player => {
			if(player.isBan)
				return Promise.resolve(urljoin(Kancolle.ENTRY_HOST, 'kcs', 'ban.swf'));
			else
				return Promise.resolve(urljoin(server.host, 'kcs', 'mainD2.swf', '?api_token=' + player.api_token, '?api_starttime=' + player.api_start_time));
		})
	}
}

module.exports = exports = Hub;