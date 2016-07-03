'use strict';

const DmmGame = require('../../scripts/model/dmmGame');
const Account = require('../../scripts/model/dmmAccount');

describe('DMM game abstract class', function() {

	var dmmGame, account;

	beforeEach(function() {
		account = new Account('poi@poi.com', 'poipoi');
		dmmGame = new DmmGame(account);
	})

	it('get expected gadget information', function() {
		
	})

})
