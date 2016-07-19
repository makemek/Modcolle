'use strict';

const inherit = require('inherit');
const rp = require('request-promise');
const async = require('async');
const appLog = require('winston').loggers.get('app');

var DmmAccount = {
	__constructor: function(email, password) {
		this.email = (email || '').trim();
		this.password = (password || '').trim();
		this.cookie = [];
		appLog.verbose('create an account object');
		appLog.debug('email: ' + this.email);
		appLog.debug('password: ' + this.password);
	},

	login: function(accountCallback) {
		if(!this.email.length) {
			appLog.error('email is empty');
			return accountCallback(new Error('email is empty'));
		}
		if(!this.password.length) {
			appLog.error('password is empty');
			return accountCallback(new Error('password is empty'));
		}

		async.waterfall([
			scrapeToken(),
			authorizeToken(),
			authenticate(this)
		], accountCallback);
	},

	getCookie: function() {
		return this.cookie;
	}
}

function scrapeToken() {
	return function(done) {
		var options = {
			uri: 'https://www.dmm.com/my/-/login/=/path=Sg__/'
		}
		appLog.info('scrape login token from ' + options.uri);
		appLog.debug('options to module request');
		appLog.debug(options);

		rp.get(options).then(function(htmlBody) {
			var tokens = htmlBody.match(/[a-f0-9]{32}/g);
			const DMM_TOKEN = tokens[1];
			const DATA_TOKEN = tokens[2];

			appLog.debug('token from scraping');
			appLog.debug(tokens);
			appLog.debug('DMM_TOKEN: ' + DMM_TOKEN);
			appLog.debug('DATA_TOKEN: ' + DATA_TOKEN);
			return done(null, DMM_TOKEN, DATA_TOKEN);	
		}).catch(function(error) {
			appLog.error(error);
			done(error);
		});
	}
}

function authorizeToken() {
	return function(DMM_TOKEN, DATA_TOKEN, done) {
		var options = {
			uri: 'https://www.dmm.com/my/-/login/ajax-get-token/',
			headers: {
				'DMM_TOKEN': DMM_TOKEN,
				'x-requested-with': 'XMLHttpRequest'
			},
			form: {
				token: DATA_TOKEN
			}
		}
		appLog.debug('DMM_TOKEN: ' + DMM_TOKEN);
		appLog.debug('DATA_TOKEN: ' + DATA_TOKEN);
		appLog.info('authorize DMM Token and Data Token at ' + options.uri);
		appLog.debug('options to module request');
		appLog.debug(options);

		rp.post(options).then(function(tokens) {
			appLog.verbose('token received from ' + options.uri);
			appLog.debug(tokens);
			done(null, JSON.parse(tokens));
		}).catch(function(error) {
			appLog.error(error);
			done(error);
		})
	}
}

function authenticate(self) {
	return function(dmmAjaxToken, done) {
		appLog.debug('JSON token');
		appLog.debug(dmmAjaxToken);
		appLog.debug('email: ' + self.email);
		appLog.debug('password: ' + self.password);

		appLog.verbose('prepare POST parameters');
		var payload = {
			token: dmmAjaxToken.token,
			login_id: self.email,
			save_login_id: 0,
			password: self.password,
			save_password: 0,
			use_auto_login: 1,
			path: 'Sg__',
			prompt: '',
			client_id: '',
			display: ''
		}
		payload[dmmAjaxToken.login_id] = self.email;
		payload[dmmAjaxToken.password] = self.password;

		var options = {
			uri: 'https://www.dmm.com/my/-/login/auth/',
			headers: {'Upgrade-Insecure-Requests': 1},
			form: payload,
			resolveWithFullResponse: true
		}

		appLog.info('authenticate email and password to ' + options.uri);
		appLog.debug('options to module request');
		appLog.debug(options);

		rp.post(options).then(function(response) {
			// incorrect email or password will return statusCode 200 with empty body
			appLog.verbose('response retrieved from ' + options.uri);
			appLog.debug('status code: ' + response.statusCode);
			appLog.debug(response.headers);
			appLog.warn('login rejected');

			self.cookie = response.headers['set-cookie'];
			done(null, false);
		}).catch(function(error) {
			var response = error.response;
			var loginGranted = error.statusCode == 302 && response.headers.hasOwnProperty('set-cookie');

			appLog.debug('status code: ' + error.statusCode);
			appLog.debug(response.headers);
			appLog.debug('login granted: ' + loginGranted);

			if(loginGranted) {
				appLog.info('login success');
				self.cookie = response.headers['set-cookie'];
				done(null, true);
			}
			else {
				appLog.error(error);
				done(error);
			}
		})
	}
}

module.exports = exports = inherit(DmmAccount);
