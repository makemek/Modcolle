'use strict';

const Cookie = require('tough-cookie').Cookie;
const sprintf = require('sprintf-js').sprintf
const Injector = require('../../src/dmm/cookie/injector');
const async = require('async');

describe('Region cookie generator', function() {

	async.forEach([
	[],
	[new Cookie({key: 'ckcy', value: 1}).toString()],
	[new Cookie({key: 'ckcy', value: 9999}).toString()]
	], function(item) {
		it('cookie ckcy is set to 1 with given cookie ' + item, function(done) {
			var dmmDomainPath = ['/', '/netgame/', '/netgame_s/'];
			var injector = new Injector(dmmDomainPath, item);
			injector.revokeRegionRestriction()
			.end(function(error, cookies) {
				assert.isNull(error, 'there should be no error');
				var ckcy = cookies.filter(function(cookie) { return cookie.key == 'ckcy' });
				assert.equal(ckcy.length, dmmDomainPath.length);

				ckcy.forEach(function(cookie) {
					assert.equal(cookie.key, 'ckcy');
					assert.equal(cookie.value, 1);
					assert.equal(cookie.domain, 'dmm.com');
					assert.include(dmmDomainPath, cookie.path);
				})
				done();
			});
		})
	})

	async.forEach(['ja', 'en'], function(lang) {
		it('set language cookie to ' + lang, function(done) {
			var dmmDomainPath = ['/', '/netgame/', '/netgame_s/'];
			var injector = new Injector(dmmDomainPath, [new Cookie({key: 'cklg', value: lang}).toString()]);
			injector.language(lang)
			.end(function(error, cookies) {
				assert.isNull(error, 'there should be no error');
				var cklg = cookies.filter(function(cookie) { return cookie.key == 'cklg' });
				assert.equal(cklg.length, dmmDomainPath.length);

				cklg.forEach(function(cookie) {
					assert.equal(cookie.key, 'cklg');
					assert.equal(cookie.value, lang);
					assert.equal(cookie.domain, 'dmm.com');
					assert.include(dmmDomainPath, cookie.path);
				})
				done();
			});
		})
	})
	
})
