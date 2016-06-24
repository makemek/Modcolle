'use strict';

const inherit = require('inherit');

var DmmAccount = {
	__constructor: function(email, password) {
		this.email = email || '';
		this.password = password || '';
	},

	login: function(onSuccess, onFailure) {
		if(!this.email.length)
			return onFailure('email is empty');
	}
}

module.exports = exports = inherit(DmmAccount);
