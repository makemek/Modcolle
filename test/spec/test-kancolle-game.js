'use strcit';

const Account = require('../../scripts/dmm/account');
const Kancolle = require('../../scripts/kancolle/game');

describe('Kancolle game', function() {

	var kancolle;

	beforeEach(function() {
		var account = new Account('poi@poi.com', 'poipoi');
		kancolle = new Kancolle(account);
	})

	it('return correcct game ID', function() {
		const ID = 854854;
		assert.equal(kancolle._getAppId(), ID, 'Kancolle app id should be ' + ID);
	})

})
