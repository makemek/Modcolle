'use strict';

const servers = require('./server/');
const Kancolle = require('./game');
const urljoin = require('url-join');

var Hub = {};

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
 * @callback doneCallback
 * @param {null|object} error
 * @param {string} swfLink - HTTP URL to SWF file
 */

/**
 * Start Kancolle
 * @param  {object}   gadgetInfo - gadget information containing player's id and security token issued by DMM
 * @param  {doneCallback} done   - callback function
 */
Hub.launch = function(gadgetInfo, done) {
	var host = 'http://' + Kancolle.ENTRY_IP; 
	Kancolle.getWorldServerId(gadgetInfo, function(error, worldId) {
		var isNewPlayer = worldId == 0;
		if(error)
			return done(error);
		if(worldId < 0)
			return done(new Error('invalid world id. should be greater than 0, but got ' + worldId));
		else if(isNewPlayer)
			return done(null, urljoin(host, 'world.swf'));
		else
			oldPlayer();
	})

	if(servers.hasOwnProperty(KEY))
		return servers[KEY];
	return null;
}

module.exports = exports = Hub;