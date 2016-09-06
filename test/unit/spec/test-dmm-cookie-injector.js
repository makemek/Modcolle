'use strict';

const Cookie = require('tough-cookie').Cookie;
const sprintf = require('sprintf-js').sprintf
const Injector = require(SRC_ROOT + '/dmm/cookie-injector');
const async = require('async');

describe('Region cookie generator', function() {

	var dmmDomainPath = ['/', '/netgame/', '/netgame_s/'];

	async.forEach([
	{case: 'no cookie', input: []},
	{case: 'valid pre-existing cookie', input: [new Cookie({key: 'ckcy', value: 1}).toString()]},
	{case: 'invalid pre-existing cookie', input: [new Cookie({key: 'ckcy', value: 9999}).toString()]}
	], function(item) {
		it('should revoke region restriction with ' + item.case, function() {
			var injector = new Injector(item.input, dmmDomainPath);
			var cookies = injector.revokeRegionRestriction()

			var ckcy = cookies.filter(function(cookie) { return cookie.key == 'ckcy' });
			assert.equal(ckcy.length, dmmDomainPath.length);

			ckcy.forEach(function(cookie) {
				assert.equal(cookie.key, 'ckcy');
				assert.equal(cookie.value, 1);
				assert.equal(cookie.domain, 'dmm.com');
				assert.include(dmmDomainPath, cookie.path);
			})
		})
	})

	async.forEach([
		{case: 'Japanese', input: 'ja'},
		{case: 'English', input: 'en'}
		], function(lang) {
		it('set language cookie to ' + lang.case, function() {
			var injector = new Injector([new Cookie({key: 'cklg', value: lang.input}).toString()], dmmDomainPath);
			var cookies = injector.language(lang.input);

			var cklg = cookies.filter(function(cookie) { return cookie.key == 'cklg' });
			assert.equal(cklg.length, dmmDomainPath.length);

			cklg.forEach(function(cookie) {
				assert.equal(cookie.key, 'cklg');
				assert.equal(cookie.value, lang.input);
				assert.equal(cookie.domain, 'dmm.com');
				assert.include(dmmDomainPath, cookie.path);
			})
		})
	})

	it('should set default cookie to empty array', function() {
		var injector = new Injector();
		assert.deepEqual(injector.cookies, [], 'should be empty array');
	})
	
	it('should set default sub domain to root page', function() {
		var injector = new Injector();
		assert.equal(injector.subdomains, '/', 'should be a root page');
	})

	it('should set default language to Japanese', function() {
		var injector = new Injector();
		var cookies = injector.language();

		cookies.forEach(function(cookie) {
			assert.equal(cookie.value, Injector.language.japan);
		})
	})
})
