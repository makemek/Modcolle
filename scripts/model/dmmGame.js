'use strict';

const request = require('request');
const inherit = require('inherit');

const NETGAME_LINK = 'www.dmm.com/netgame/social/-/gadgets/=/app_id=';
var DmmGame = {

	__constructor: function(account) {
		this.account = account;
		this.gadgetInfo = {};
	},

	preload: function() {},

	start: function(onDone) {
		getAppInfo(this.account.getCookie(), function(error, gadget) {
			this.gadgetInfo = gadget;
			this.preload();
			onDone();
		})
	}
}

var staticProperties = {
	id: {
		kancolle: 854854
	}
}

function getAppInfo(sessionCookie, resultCallback) {

}

module.exports = exports = inherit(DmmGame, staticProperties);
