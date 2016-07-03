'use strict';

const DmmGame = require('../../scripts/model/dmmGame');
const Account = require('../../scripts/model/dmmAccount');

describe.only('DMM netgame', function() {

	beforeEach(function() {
		var account = new Account('poi@poi.com', 'poipoi');
		var game = new DmmGame(account);
	})

	it('should get DMM gadget information about the game', function() {

	})

	it('should contain correct game id', function() {

	})

})
