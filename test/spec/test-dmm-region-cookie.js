'use strict';

const regionCookie = require('../../src/dmm/cookie/region-cookie');
const Cookie = require('tough-cookie').Cookie;
const sprintf = require('sprintf-js').sprintf
const Injector = require('../../src/dmm/cookie/injector');
const async = require('async');

describe('Region cookie generator', function() {

	async.forEach([
	{key: 'ckcy', val: '1'}, 
	{key: 'cklg', val: 'welcome'}
	], function(expectedCookie) {
		var expectName = expectedCookie.key;
		var expectVal = expectedCookie.val;

		it('has generate cookie: ' + expectName, function() {
			var regionCookies = regionCookie.generate();

			var targetCookie = regionCookies.filter(function(cookie) {
				return Cookie.parse(cookie).key == expectName;
			})

			var dmmDomainPath = ['/', '/netgame/', '/netgame_s/'];
			targetCookie.forEach(function(cookie) {
				cookie = Cookie.parse(cookie);

				assert.equal(cookie.key, expectName, sprintf('should have cookie %s', expectName));
				assert.include(expectVal, cookie.value, sprintf('%s should be set to %s', expectName, expectVal));
				assert.equal(cookie.domain, 'dmm.com', sprintf('%s should include domain DMM', expectName));
				assert.include(dmmDomainPath, cookie.path, sprintf('%s should include path', expectName));
				
			})
		})
	})

	async.forEach([
	[],
	[new Cookie({key: 'ckcy', value: 1}).toString()],
	[new Cookie({key: 'ckcy', value: 9999}).toString()]
	], function(item) {
		it('cookie ckcy is set to 1 with given cookie ' + item, function(done) {
			var injector = new Injector(item);
			injector.revokeRegionRestriction()
			.end(function(error, cookies) {
				assert.isNull(error, 'there should be no error');
				var ckcy = cookies.filter(function(cookie) { return cookie.key == 'ckcy' });
				var dmmDomainPath = ['/', '/netgame/', '/netgame_s/'];
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
			var injector = new Injector([new Cookie({key: 'cklg', value: lang}).toString()]);
			injector.language(lang)
			.end(function(error, cookies) {
				assert.isNull(error, 'there should be no error');
				var cklg = cookies.filter(function(cookie) { return cookie.key == 'cklg' });
				var dmmDomainPath = ['/', '/netgame/', '/netgame_s/'];
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
