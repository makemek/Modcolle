'use strict';

const request = require('request');
const inherit = require('inherit');
const async = require('async');
const sprintf = require('sprintf-js').sprintf;
const rp = require('request-promise');
const appLog = require('winston').loggers.get('app');

var API = {

	__constructor: function(account) {
		this.account = account;
		appLog.debug('create OSAPI object');
	},

	getGameInfo(gameId, done) {
		appLog.verbose('Get game metadata');
		var url = createGameUrl(gameId);
		var cookie = this.account.getCookie();

		if(typeof(cookie) == 'object')
			cookie = cookie.join('; ');

		if(!cookie.match(/ccky=1/g)) 
			appLog.warn('Japan cookie region not set. DMM may reject the access');

		var options = {
			uri: url,
			headers: {cookie: cookie}
		}
		appLog.info('request page ' + options.uri);
		appLog.debug(options);

		rp.get(options).then(function(htmlBody) {
			appLog.info('response received from ' + options.uri);
			var gadgetInfo = getGadgetInfo(htmlBody);

			if(!gadgetInfo) {
				var error = new Error('gadget info not found')
				appLog.error(error.message);
				return done(error);
			}
			else
				return done(null, gadgetInfo);

		}).catch(done)
	}
}

function createGameUrl(gameId) {
	const URL = 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=';
	return URL.concat(gameId);
}

function getGadgetInfo(htmlString) {
	appLog.info('get unparsed json from variable gadgetInfo');
	var varName = 'gadgetInfo = ';
	var gadgetInfo = htmlString.match(new RegExp(varName + '{([^}]*)}', 'g'));
	if(!gadgetInfo)
		return null;
	else
		gadgetInfo = gadgetInfo[0];

	appLog.debug(sprintf('remove prefix "%s"', varName));
	gadgetInfo = gadgetInfo.replace(varName, '');
	appLog.debug(gadgetInfo);

	appLog.debug('get variable name');
	var varList = gadgetInfo.match(/\w+ /g);
	appLog.debug(varList);

	appLog.debug('put double quotes around the variable');
	varList.forEach(function(property) {
		property = property.trim();
		gadgetInfo = gadgetInfo.replace(property, sprintf('"%s"', property))
	})
	appLog.debug(gadgetInfo);
	
	appLog.debug('convert to json');
	gadgetInfo = JSON.parse(gadgetInfo);
	appLog.debug(gadgetInfo);

	return gadgetInfo;
}

module.exports = exports = inherit(API);
