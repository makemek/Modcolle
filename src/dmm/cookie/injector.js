'use strict';

const inherit = require('inherit');
const async = require('async');
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
		if (cookies instanceof Array)
		  cookies = cookies.map(Cookie.parse);
		else
		  cookies = [Cookie.parse(cookies)];

		this.cookies = cookies;
		this.tasks = [];
		this.subdomains = subdomains || ['/'];
		this.domain = 'dmm.com';
	},

	revokeRegionRestriction: function() {
		var targetCookie = {key: 'ckcy', value: 1};
		var self = this;
		this.tasks.push(function(done) {
			self.cookies = self.cookies.filter(function(cookie) {
				return cookie.key != targetCookie.key;
			})

			self.cookies = self.cookies.concat(generateCookies(targetCookie, [self.domain], self.subdomains));
			done();
		});

		return this;
	},

	language: function(language) {
		language = language || languagePreset.japan;
		var targetCookie = {key: 'cklg', value: language};
		var self = this;
		this.tasks.push(function(done) {
			self.cookies = self.cookies.filter(function(cookie) {
				return cookie.key != targetCookie.key;
			})

			self.cookies = self.cookies.concat(generateCookies(targetCookie, [self.domain], self.subdomains));
			done();
		});

		return this;
	},

	end: function(done) {
		var self = this;
		async.series(this.tasks, function(error) {
			done(error, self.cookies);
		});
	}
}

function generateCookies(keyVal, domains, paths) {
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

	return cookies;
}

module.exports = exports = inherit(Injector, languagePreset);
