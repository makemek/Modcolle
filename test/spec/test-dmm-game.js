'use strict';

const DmmGame = require('../../scripts/model/dmmGame');
const Account = require('../../scripts/model/dmmAccount');

describe.only('DMM netgame', function() {

	beforeEach(function() {
		var account = new Account('poi@poi.com', 'poipoi');
		var game = new DmmGame(account);
	})

	var netGame = gameIdList();
	for(var game in netGame) {
		it('should contain id of game ' + game, createTestParameterizeGameList(game, netGame[game]))
	}

	it('should get DMM gadget information about the game', function() {

	})
})

function gameIdList() {
	return {
		kancolle: 854854
	}
}

function createTestParameterizeGameList(gameName, expectedId) {
	return function() {
		assert.isObject(DmmGame.id, 'DmmGame should have property id');
		assert.equal(DmmGame.id[gameName], expectedId, 'game id should match');	
	}
}
