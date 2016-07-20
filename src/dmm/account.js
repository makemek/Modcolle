'use strict';

const inherit = require('inherit');

var Account = {

	__consturctor: function(email, password, sessionCookie) {
		this.email = (email || '').trim();
		this.password = (password || '').trim();
		this.cookie = sessionCookie;
		appLog.verbose('create an account object');
		appLog.debug('email: ' + this.email);
		appLog.debug('password: ' + this.password);
	},

	getCookie: function() {
		return this.cookie;
	}
}

module.exports = exports = inherit(Account);
