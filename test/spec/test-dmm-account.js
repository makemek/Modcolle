'use strict';

const DmmAccount = require('../../scripts/model/dmmAccount');
const sinon = require('sinon');

describe('DMM account', function() {

	it('empty email', sinon.test(function() {
		var account = new DmmAccount('', '1234');
		expectError(account);
	}))

	it('empty password', sinon.test(function() {
		var account = new DmmAccount('john@example.com', '');
		expectError(account);
	}))

	it.skip('login fail due to incorrect email or password', sinon.test(function() {
		var cookieCallback = this.spy();
		var account = new DmmAccount('john@example.com', '1234');
		account.login(cookieCallback);

		sinon.assert.called(cookieCallback);
		console.log(cookieCallback.args);
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
