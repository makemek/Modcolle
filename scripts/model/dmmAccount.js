'use strict';

const inherit = require('inherit');

var DmmAccount = {
	__constructor: function(email, password) {
		this.email = email;
		this.password = password;
	},

	login: function(onSuccess, onFailure) {

	}
}

module.exports = exports = inherit(DmmAccount);
