'use strict';

const request = require('request');
const inherit = require('inherit');

const NETGAME_LINK = 'www.dmm.com/netgame/social/-/gadgets/=/app_id=';
var DmmGameAbstract = {

	__constructor: function(account) {
		this.account = account;
		this.gadgetInfo = {};
		this.appId;
	},

	getAppId: function() {},

	preload: function(onDone) {},

	start: function(onDone) {
		getAppInfo(this.account.getCookie(), this.getAppId(), function(error, gadget) {
			this.gadgetInfo = gadget;
			this.preload();
			onDone();
		})
	}
}

function getAppInfo(sessionCookie, appId, resultCallback) {

}

module.exports = exports = inherit(DmmGameAbstract);
