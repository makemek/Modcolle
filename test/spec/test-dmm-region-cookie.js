'use strict';

const regionCookie = require('../../src/dmm/cookie/region-cookie');
const Cookie = require('tough-cookie').Cookie;
const sprintf = require('sprintf-js').sprintf

describe('Region cookie generator', function() {

	[
	{key: 'ckcy', val: '1'}, 
	{key: 'cklg', val: 'welcome'}
	].forEach(function(expectedCookie) {
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

})
