'use strict';

const dmmPassport = require(SRC_ROOT + '/middleware/dmm-passport');
const dmmAgent = require(SRC_ROOT + '/dmm/agent');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const nockDmmAuth = require('../mock/dmm/auth');
const async = require('async');
const sinon = require('sinon');

describe('DMM passport middleware', function() {

	it('grant access', function(done) {
		dmmPassport.authenticate('someone@example.com', 'password', function(error, cookies) {
			if(error)
				return done(error);

			cookies = cookies.map(Cookie.parse);
			cookies.filter(function(cookie) {
				return cookie.key === 'INT_SESID';
			})
			assert.equal(cookies.length, 1, 'should have 1 session cookie (INT_SESID)');
			done();
		});
	})

	it('deny access', function(done) {
		dmmPassport.authenticate(nockDmmAuth.badAccount.email, nockDmmAuth.badAccount.password, function(error, cookies) {
			if(error)
				return done(error);
			assert.isFalse(cookies, 'cookies should be false');
			done();
		})
	})

	async.forEach([
	{case: 'no cookies', input: []},
	{case: 'no session', input: ['others=doe', 'foo=bar']},
	{case: 'more than 1 sessions', input: [nockDmmAuth.session, nockDmmAuth.session, nockDmmAuth.session]}
	], function(testcase) {
		it('serialize ' + testcase.case + ' should return an error', function(done) {
			dmmPassport.serialize(testcase.input, function(error, session) {
				assert.isTrue(error instanceof Error);
				assert.isUndefined(session, 'no session should be given');
				done();
			})
		})
	})

	it('serialize 1 session', function(done) {
		var others = 'others=doe', foo = 'foo=bar';
		var cookies = [nockDmmAuth.session, others, foo];
		dmmPassport.serialize(cookies, function(error, injectedCookies) {
			if(error)
				return done(error);
			
			assert.isArray(injectedCookies, 'session should be an array');
			injectedCookies = injectedCookies.join('; ');
			assert.include(injectedCookies, nockDmmAuth.session);
			assert.notInclude(injectedCookies, others);
			assert.notInclude(injectedCookies, foo);
			assert.include(injectedCookies, 'ckcy');
			done();
		})
	})

	it('deserialize session', function(done) {
		var expectedCookies = [nockDmmAuth.session, 'others=doe'];
		dmmPassport.deserialize(expectedCookies, function(error, cookies) {
			if(error)
				return done(error);

			assert.equal(cookies, expectedCookies, 'no cookie should be altered');
			done();
		})
	})

	it('if authenticated, callback next middleware', sinon.test(function() {
		var req = {isAuthenticated: function() {return true}};
		var res = {redirect: function() {}};
		var spyRes = this.spy(res, 'redirect'), spyNext = this.spy();
		dmmPassport.isAuthenticated(req, res, spyNext);
		assert.isTrue(spyNext.calledOnce, 'callback should be called once');
		assert.isFalse(spyRes.called, 'response should never be called');
	}))

	it('if not authenticate, redirect to home page', sinon.test(function() {
		var req = {isAuthenticated: function() {return false}};
		var res = {redirect: function() {}};
		var spyRes = this.spy(res, 'redirect'), spyNext = this.spy();
		dmmPassport.isAuthenticated(req, res, spyNext);
		assert.isFalse(spyNext.called, 'callback should never be called');
		assert.isTrue(spyRes.calledOnce, 'response should be called once');
		assert.equal(spyRes.firstCall.args[0], '/', 'should redirect to home page');
	}))
})