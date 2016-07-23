'use strict';

const inherit = require('inherit');
const async = require('async');
const appLog = require('winston').loggers.get('app');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;

var languagePreset = {
	language: {
		japan: 'ja',
		english: 'en'
	}
}

var Injector = {

	__constructor: function(subdomains, cookies) {
		appLog.verbose('parse cookie');
		if (cookies instanceof Array)
		  cookies = cookies.map(Cookie.parse);
		else
		  cookies = [Cookie.parse(cookies)];
		appLog.debug(cookies);

		this.cookies = cookies;
		this.tasks = [];
		this.subdomains = subdomains || ['/'];
		this.domain = 'dmm.com';
	},

	revokeRegionRestriction: function() {
		var targetCookie = {key: 'ckcy', value: 1};
		var self = this;
		appLog.verbose('push async task');
		this.tasks.push(function(done) {
			appLog.verbose('remove cookies that has value ' + targetCookie.key);
			self.cookies = self.cookies.filter(function(cookie) {
				return cookie.key != targetCookie.key;
			})
			appLog.debug(self.cookies);

			appLog.verbose('merge generated cookies');
			self.cookies = self.cookies.concat(generateCookies(targetCookie, [self.domain], self.subdomains));
			appLog.debug(self.cookies);
			done();
		});

		return this;
	},

	language: function(language) {
		language = language || languagePreset.japan;
		var targetCookie = {key: 'cklg', value: language};
		var self = this;
		appLog.verbose('push async task');
		this.tasks.push(function(done) {
			appLog.verbose('remove cookies that has value ' + targetCookie.key);
			self.cookies = self.cookies.filter(function(cookie) {
				return cookie.key != targetCookie.key;
			})
			appLog.debug(self.cookies);

			appLog.verbose('merge generated cookies');
			self.cookies = self.cookies.concat(generateCookies(targetCookie, [self.domain], self.subdomains));
			appLog.debug(self.cookies);
			done();
		});

		return this;
	},

	end: function(done) {
		appLog.info("start queued cookie injector's tasks");
		var self = this;
		async.series(this.tasks, function(error) {
			done(error, self.cookies);
		});
	}
}

function generateCookies(keyVal, domains, paths) {
	appLog.verbose('create cookies');
	appLog.debug(keyVal);
	appLog.debug(domains);
	appLog.debug(paths);

	var cookies = [];
	domains.forEach(function(domain) {
		paths.forEach(function(path) {
			var options = keyVal;
			options.domain = domain;
			options.path = path;

			var cookie = new Cookie(options);
			cookies.push(cookie);
		})
	})

	appLog.debug(cookies);
	return cookies;
}

module.exports = exports = inherit(Injector, languagePreset);
