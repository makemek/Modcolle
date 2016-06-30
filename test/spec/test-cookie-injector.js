'use strict';

const regionCookieInjector = require('../../scripts/model/regionCookieInjector');
const cookie = require('cookie');

describe('Region cookie injector', function() {

	[
		[],
		['fake1=fakeValue1', 'fake2=fakeValue2'],
		['ckcy=1', 'cklg=ja']
	].forEach(function(param) {
		it('has injected the right cookie given by array of cookies ' + param, function() {
			var injectedCookie = regionCookieInjector.inject(param);
			assert.isString(injectedCookie);
			var cookieJson = cookie.parse(injectedCookie);

			param.forEach(function(fakeCookie) {
				var parsedCookie = cookie.parse(fakeCookie);
				assert.include(cookieJson, parsedCookie);
			})
			assert.isTrue(cookieJson.hasOwnProperty('ckcy'), 'should have cookie "ckcy"');
			assert.equal(cookieJson.ckcy, 1, '"ckcy" should be set to "1"');
			assert.isTrue(cookieJson.hasOwnProperty('cklg'), 'should have cookie "cklg"');
			assert.equal(cookieJson.cklg, 'ja', '"cklg" should be set to "ja" (japan)');
		})
	})

})
