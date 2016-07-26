'use strcit';

const Kancolle = require('../../src/kancolle/game');
const rp = require('request-promise');
const sinon = require('sinon');
const async = require('async');
const sprintf = require('sprintf-js').sprintf;

describe('Kancolle game', function() {

	it('return correcct game ID', function() {
		const ID = 854854;
		assert.equal(Kancolle._getAppId(), ID, 'Kancolle app id should be ' + ID);
	})

	describe('Maintenance test', function() {

		var code;
		beforeEach(function() {
		code = 
		`
		var ConstServerInfo = {servFoo:"servBar"}, ConstURLInfo = {urlFoo:"urlBar"};
		var MaintenanceInfo = {};
		MaintenanceInfo.IsDoing       = %d;
		MaintenanceInfo.IsEmergency   = %d;
		MaintenanceInfo.StartDateTime = Date.parse("2016/07/15 11:00:00");
		MaintenanceInfo.EndDateTime   = Date.parse("2016/07/15 17:50:00");
		`
		})

		it('is NOT on maintenance', function(done) {
			var sourceText = sprintf(code, 0, 0);
			var httpRequest = sinon.stub(rp, 'get').returns({
				then: function(bodyCallback) {bodyCallback(sourceText); return this;},
				catch: function() {}
			})

			Kancolle.getMaintenanceInfo(function(error, maintenanceInfo) {
				assert.isNull(error);
				assert.isFalse(maintenanceInfo.isMaintain);

				httpRequest.restore();
				done();
			})
		})

		async.forEach([
		{doing: 0, emergency: 1},
		{doing: 1, emergency: 0},
		{doing: 1, emergency: 1}], function(mode, callback) {
			it(sprintf('is on maintenance (doing = %d, emergency = %d)', mode.doing, mode.emergency), function(done) {
				var sourceText = sprintf(code, mode.doing, mode.emergency);
				var httpRequest = sinon.stub(rp, 'get').returns({
					then: function(bodyCallback) {bodyCallback(sourceText); return this;},
					catch: function() {}
				})

				Kancolle.getMaintenanceInfo(function(error, maintenanceInfo) {
					assert.isNull(error);
					assert.isTrue(maintenanceInfo.isMaintain);

					httpRequest.restore();
					done();
				})
			})

			callback();
		});
	})
})

