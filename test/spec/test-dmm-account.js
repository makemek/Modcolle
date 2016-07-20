'use strict';

const Agent = require('../../src/dmm/agent');
const async = require('async');
const dmmAuth = require('../mock/dmm/auth');

describe('DMM agent', function() {

	var taskList, agent;
	beforeEach(function() {
		agent = new Agent();
	})

	it('login with empty email', function(done) {
		async.each(['', '      '], function(email, callback) {
			var agent = new Agent();
			var password = '1234';
			agent.login(email, password, function(error, isSuccess) {
				assert.isNotNull(error);
				callback();
			})
		}, done);
	})

	it('login with empty password', function(done) {
		async.each(['', '      '], function(password, callback) {
			var agent = new Agent();
			var email = 'poi@poi.com';
			agent.login(email, password, function(error, isSuccess) {
				assert.isNotNull(error);
				callback();
			})
		}, done);
	})

	it('scrape login token from DMM login page', function(done) {
		agent.scrapeToken(function(error, DMM_TOKEN, DATA_TOKEN) {
			assert.isNull(error, 'should have no error');
			assert.equal(DMM_TOKEN, dmmAuth.token.dmm, 'DMM token should be equal');
			assert.equal(DATA_TOKEN, dmmAuth.token.data, 'data token should be equal');
			done();
		});
	})

	it('authroize token', function(done) {
		agent.authorizeToken(dmmAuth.token.dmm, dmmAuth.token.data, function(error, authToken) {
			assert.isNull(error);
			assert.equal(authToken.token, dmmAuth.token.auth.token);
			assert.equal(authToken.login_id, dmmAuth.token.auth.login_id);
			assert.equal(authToken.password, dmmAuth.token.auth.password);
			done();
		});
	})

	it('authentication success', function(done) {
		agent.authenticate('some@one.com', 'password', dmmAuth.token.auth, function(error, isSuccess, cookie) {
			assert.isNull(error, 'there should be no error');
			assert.isBoolean(isSuccess, 'should indicate whether the login is success (email and password are correct)');
			assert.isTrue(isSuccess, 'authentication should success');

			assert.equal(cookie, dmmAuth.session);
			done();
		});
	})

	it('authentication fail due to incorrect email or password', function(done) {
		var badAccount = new Agent();
		badAccount.authenticate(dmmAuth.badAccount.email, dmmAuth.badAccount.password, dmmAuth.token.auth, function(error, isSuccess) {
			assert.isNull(error, 'there should be no error');
			assert.isFalse(isSuccess, 'login should fail');
			done();
		})
	});
})
