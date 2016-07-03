'use strict';

const request = require('request');
const inherit = require('inherit');
const async = require('async');

const NETGAME_LINK = 'www.dmm.com/netgame/social/-/gadgets/=/app_id=';
var DmmGameAbstract = {

	__constructor: function(account) {
		this.account = account;
	},

	_getAppId: function() {},

	_preload: function(onDone, gadgetInfo) {},

	start: function(onDone) {
		async.waterfall([
			getAppInfo(this.account.getCookie(), this._getAppId()),
			this._preload
			], onDone)
	}
}

function getAppInfo(sessionCookie, appId) {
	return function(done) {

	}
}

module.exports = exports = inherit(DmmGameAbstract);
