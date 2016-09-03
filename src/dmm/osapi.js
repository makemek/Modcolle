'use strict';

const request = require('request');
const inherit = require('inherit');
const async = require('async');
const sprintf = require('sprintf-js').sprintf;
const rp = require('request-promise');
const appLog = require('winston').loggers.get('app');

var API = {
	getGameInfo: function(gameId, dmmCookies) {
		appLog.verbose('Get game metadata');
		var url = createGameUrl(gameId);
		var cookies = dmmCookies;

		if(Array.isArray(dmmCookies))
			cookies = cookies.join('; ');

		var fromJapan = cookies.match(/ckcy\w*=\w*1/g);
		if(!fromJapan)
			appLog.warn('User does not login from Japan. DMM may reject the access');

		var options = {
			uri: url,
			headers: {cookie: cookies}
		}
		appLog.info('request page ' + options.uri);
		appLog.debug(options);

		return rp.get(options)
		.then(htmlBody => {
			appLog.info('response received from ' + options.uri);
			var gadgetInfo = getGadgetInfo(htmlBody);

			if(!gadgetInfo) {
				var error = new Error('gadget info not found')
				appLog.error(error.message);
				return Promise.reject(error);
			}
			else
				return Promise.resolve(gadgetInfo);
		})
	},

	/**
	 * Callback function for performing http request
	 *
	 * @callback proxyRequestCallback
	 * @param {null|object} error
	 * @param {object} response - parsed JSON response
	 * {
	 * 	"body": #response
	 * 	"headers": #headers
	 * 	"rc": #status
	 * } 
	 * where 
	 * #response is the response from a the target url
	 * #headers are http response header from the target server
	 * #status is the http status code from the target server
	 */

	/**
	 * Carry out proxy http GET request to DMM server
	 * Where DMM will forward request to the destinated url with OAuth 1.0 authentication
	 *
	 * @param {string} target url - destinated url
	 * @param {object} gadgetInfo - gadget information aquired from accessing DMM net game page
	 * @param {proxyRequestCallback} done - a callback function
	 */
	proxyRequest: function(targetUrl, gadgetInfo) {
		appLog.info('create proxy request to %s', targetUrl);
		var payload = {
			url: targetUrl,
			st: gadgetInfo.ST,
			authz: 'signed',
			signOwner: true
		};

		var options = {
			url: 'http://osapi.dmm.com/gadgets/makeRequest',
			form: payload
		};

		appLog.debug('POST options', options);
		return rp.post(options)
		.then(response => {
			appLog.info('response received from %s', options.url);
			appLog.verbose('response: %s', response);

			var wrapper = "throw 1; < don't be evil' >";
			appLog.verbose("remove response wrapper (%s)", wrapper);
			var dmmResponse = response.slice(response.search(wrapper) + wrapper.length);
			appLog.debug(dmmResponse);

			appLog.verbose('extract raw body');
			var startBody = '"body":"', endBody = '","headers":{';
			var rawBody = dmmResponse.slice(dmmResponse.search('"body":"') + startBody.length, dmmResponse.search('","headers":', -1));
			appLog.debug('rawbody', rawBody);

			appLog.verbose('replace body with escape strings');
			dmmResponse = dmmResponse.replace(rawBody, escape(rawBody));

			appLog.verbose('convert to JSON format');
			var jsonDmmResponse = JSON.parse(dmmResponse);
			var urlWrapperKeyName = Object.keys(jsonDmmResponse)[0];
			appLog.verbose('unwrap JSON property %s', urlWrapperKeyName);
			var targetResponse = jsonDmmResponse[urlWrapperKeyName];

			appLog.verbose('unescape body');
			targetResponse.body = unescape(targetResponse.body);
			appLog.debug(targetResponse);

			return Promise.resolve(targetResponse);
		})
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

module.exports = exports = API;
