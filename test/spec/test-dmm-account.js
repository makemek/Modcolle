'use strict';

const DmmAccount = require('../../scripts/model/dmmAccount');
const sinon = require('sinon');

describe('DMM account', function() {

	it('empty email', sinon.test(function() {
		var onFailureCallback = this.spy();
		var account = new DmmAccount('', '1234');
		account.login(function(){}, onFailureCallback);

		sinon.assert.called(onFailureCallback);
	}))

	it('empty password', sinon.test(function() {
		var onFailureCallback = this.spy();
		var account = new DmmAccount('john@example.com', '');
		account.login(function(){}, onFailureCallback);

		sinon.assert.called(onFailureCallback);
	}))

	it.skip('login fail due to incorrect email or password', function() {

	})

	it.skip('login success', function() {

	})

})