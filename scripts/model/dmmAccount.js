'use strict';

const inherit = require('inherit');

var DmmAccount = {
	__constructor: function(email, password) {
		this.email = email || '';
		this.password = password || '';
	},

	login: function(cookieCallback) {
		if(!this.email.length) return cookieCallback(new Error('email is empty'));
		if(!this.password.length) return cookieCallback(new Error('password is empty'));
	}
}

module.exports = exports = inherit(DmmAccount);
