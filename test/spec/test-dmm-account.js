'use strict';

const DmmAccount = require('../../scripts/model/dmmAccount');
const sinon = require('sinon');

describe('DMM account', function() {

	it('empty email', function() {
		var onFailureCallback = sinon.spy();
		var account = new DmmAccount('', '1234');
		account.login(function(){}, onFailureCallback);

		sinon.assert.called(onFailureCallback);
	})

	it.skip('empty password', function() {

	})

	it.skip('login fail due to incorrect email or password', function() {

	})

	it.skip('login success', function() {

	})

})