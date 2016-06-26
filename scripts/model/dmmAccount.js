'use strict';

const inherit = require('inherit');
const rp = require('request-promise');
const async = require('async');

var DmmAccount = {
	__constructor: function(email, password) {
		this.email = email || '';
		this.password = password || '';
	},

	login: function(cookieCallback) {
		if(!this.email.length) return cookieCallback(new Error('email is empty'));
		if(!this.password.length) return cookieCallback(new Error('password is empty'));

		async.waterfall([
			scrapeToken()
		], cookieCallback);
	}
}

function scrapeToken() {
	return function(done) {
		rp.get({
			uri: 'https://www.dmm.com/my/-/login/=/path=Sg__/',
		}).then(function(htmlBody) {
			var tokens = htmlBody.match(/[a-f0-9]{32}/g);
			const DMM_TOKEN = tokens[1];
			const DATA_TOKEN = tokens[2];
			return done(null, DMM_TOKEN, DATA_TOKEN);	
		}).catch(done);
	}
}

function authorizeToken() {
	return function(DMM_TOKEN, DATA_TOKEN, done) {
		rp.post({
			uri: 'https://www.dmm.com/my/-/login/ajax-get-token/',
			headers: {
				'DMM_TOKEN': DMM_TOKEN,
				'X-Requested-With': 'XMLHttpRequest'
			},
			form: {
				token: DATA_TOKEN
			}
		}).then(function(tokens) {
			done(null, tokens);
		}).catch(done)
	}
}

module.exports = exports = inherit(DmmAccount);
