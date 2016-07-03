'use strict';

const request = require('request');
const inherit = require('inherit');
const async = require('async');
const sprintf = require('sprintf-js').sprintf;
const rp = require('request-promise');
const appLog = require('winston').loggers.get('app');

const NETGAME_LINK = 'www.dmm.com/netgame/social/-/gadgets/=/app_id=';
var DmmGameAbstract = {

	__constructor: function(account) {
		this.account = account;
		appLog.debug('create DmmGameAbstract object');
	},

	_getAppId: function() {appLog.warn('this method should be override by subclass')},

	_preload: function(onDone, gadgetInfo) {appLog.warn('this method should be override by subclass')},

	start: function(onDone) {
		appLog.info(sprintf('start the game (DMM Game ID: %d)', this._getAppId()));
		async.waterfall([
			getAppInfo(this.account.getCookie(), this._getAppId()),
			this._preload
			], onDone)
	}
}

function getAppInfo(cookie, appId) {
	return function(done) {
		appLog.verbose('Get game metadata');

		if(typeof(cookie) == 'object')
			cookie = cookie.join('; ');

		if(!cookie.match(/ccky=1/g)) 
			appLog.warn('Japan cookie region not set. DMM may reject the access');

		rp.get({
			uri: NETGAME_LINK + appId,
			headers: {cookie: cookie}
		}).then(function(htmlBody) {
			done(null, getGadgetInfo(htmlBody));
		}).catch(done)
	}

	function getGadgetInfo(htmlBody) {

	}
}

module.exports = exports = inherit(DmmGameAbstract);
