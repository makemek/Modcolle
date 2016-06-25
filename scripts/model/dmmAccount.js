'use strict';

const inherit = require('inherit');
const request = require('request');
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
			])
	}
}

function scrapeToken() {
	return function(done) {
		request.get({
			uri: 'https://www.dmm.com/my/-/login/=/path=Sg9VTQFXDFcXFl5bWlcKGAAVRlpZWgVNCw1ZSR9KU1URAFlVSQtOU0gVblFXC14CVV0DAh9XC00LBF4FUxFeXwtcARYLTwBCSFgAF1JVEgoIC0VCUVUIFg__',
		}, function(err, response) {
			var tokens = response.body.match(/[a-f0-9]{32}/g);
			const DMM_TOKEN = tokens[1];
			const DATA_TOKEN = tokens[2];

			done(err, DMM_TOKEN, DATA_TOKEN);	
		});
	}
}

function generateLoginToken() {
	return function(DMM_TOKEN, DATA_TOKEN, done) {
		request.post({
			uri: 'https://www.dmm.com/my/-/login/ajax-get-token/',
			headers: {
				'DMM_TOKEN': DMM_TOKEN,
				'X-Requested-With': 'XMLHttpRequest'
			},
			form: {
				token: DATA_TOKEN
			}
		}, function(err, response) {
			done(err, response);
		})
	}
}

function authenticate(email, password) {
	return function(response, done) {
		var dmmAjaxToken = JSON.parse(response.body);

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

		var reqHeaders = {
			'Upgrade-Insecure-Requests': 1,
			'cookie': response.headers['set-cookie'],
		}

		request.post({
			uri: 'https://www.dmm.com/my/-/login/auth/',
			headers: reqHeaders,
			form: payload
		}, function(err, _response) {
			done(err, _response);
		})
	}
}

module.exports = exports = inherit(DmmAccount);
