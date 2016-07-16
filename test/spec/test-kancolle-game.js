'use strcit';

const Account = require('../../src/dmm/account');
const Kancolle = require('../../src/kancolle/game');
const rp = require('request-promise');
const sinon = require('sinon');

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

	it('is NOT on maintenance', function(done) {
		var sourceText = 
		`
		var ConstServerInfo = {}, ConstURLInfo = {};
		var MaintenanceInfo = {};
		MaintenanceInfo.IsDoing       = 0;
		MaintenanceInfo.IsEmergency   = 0;
		MaintenanceInfo.StartDateTime = Date.parse("2016/07/15 11:00:00");
		MaintenanceInfo.EndDateTime   = Date.parse("2016/07/15 17:50:00");
		`

		var httpRequest = sinon.stub(rp, 'get').returns({
			then: function(bodyCallback) {bodyCallback(sourceText); return this;},
			catch: function() {}
		})

		kancolle.isOnMaintenance(function(error, isMaintain) {
			assert.isNull(error);
			assert.isFalse(isMaintain);

			httpRequest.restore();
			done();
		})
	})
})
