'use strict';

const DmmAccount = require('../../scripts/model/dmmAccount');
const sinon = require('sinon');
const rp = require('request-promise');

describe('DMM account', function() {

	it('empty email', sinon.test(function() {
		var account = new DmmAccount('', '1234');
		expectError(account);
	}))

	it('empty password', sinon.test(function() {
		var account = new DmmAccount('john@example.com', '');
		expectError(account);
	}))

	it('login fail due to incorrect email or password', sinon.test(function(done) {
		var account = new DmmAccount('john@example.com', '1234');
		var server = this.fakeServer.create();
		server.respondWith('GET', 'https://www.dmm.com/my/-/login')

		account.login(function(err, cookie) {
			done(err);
		});
		console.log(httpGet.firstCall.args);
	}))

	it.skip('login success', function() {

	})

})

function expectError(account) {
	var cookieCallback = sinon.spy();

	account.login(cookieCallback);

	sinon.assert.calledOnce(cookieCallback);
	var error = cookieCallback.args[0][0];
	expect(error).to.be.an('error');

	sinon.restore();

	return error;
}
