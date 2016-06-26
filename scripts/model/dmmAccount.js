'use strict';

const inherit = require('inherit');
const rp = require('request-promise');
const async = require('async');

var DmmAccount = {
	__constructor: function(email, password) {
		this.email = (email || '').trim();
		this.password = (password || '').trim();
	},

	login: function(cookieCallback) {
		if(!this.email.length) return cookieCallback(new Error('email is empty'));
		if(!this.password.length) return cookieCallback(new Error('password is empty'));

		async.waterfall([
			scrapeToken(),
			authorizeToken(),
			authenticate(this.email, this.password)
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
				'x-requested-with': 'XMLHttpRequest'
			},
			form: {
				token: DATA_TOKEN
			}
		}).then(function(tokens) {
			done(null, tokens);
		}).catch(done)
	}
}

function authenticate(email, password) {
	return function(tokenJson, done) {
		var dmmAjaxToken = JSON.parse(tokenJson);

		var payload = {
			token: dmmAjaxToken.token,
			login_id: email,
			save_login_id: 0,
			password: password,
			save_password: 0,
			use_auto_login: 1,
			path: 'Sg__',
			prompt: '',
			client_id: '',
			display: ''
		}
		payload[dmmAjaxToken.login_id] = email;
		payload[dmmAjaxToken.password] = password;

		rp.post({
			uri: 'https://www.dmm.com/my/-/login/auth/',
			headers: {'Upgrade-Insecure-Requests': 1},
			form: payload,
			resolveWithFullResponse: true
		}).then(function(response) {
			done(null, response.headers['set-cookie']);
		}).catch(done)
	}
}

module.exports = exports = inherit(DmmAccount);
