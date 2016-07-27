'use strcit';

const Kancolle = require('../../src/kancolle/game');
const rp = require('request-promise');
const sinon = require('sinon');
const async = require('async');
const sprintf = require('sprintf-js').sprintf;
const apiTerminal = require('../mock/kancolle/api-terminal');
const KancolleChildServers = require('../../src/kancolle/server');

describe('Kancolle game', function() {

	it('return correcct game ID', function() {
		const ID = 854854;
		assert.equal(Kancolle.appId, ID, 'Kancolle app id should be ' + ID);
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

	describe('world server', function(){

		var kancolleServerIpArray = [];

		before(function() {
			Object.keys(KancolleChildServers).map(function(key) {kancolleServerIpArray.push(KancolleChildServers[key].host)})
		})

		it('return main kancolle server if player is new', function(done) {
			var gadgetInfo = {VIEWER_ID: apiTerminal.newPlayer};
			Kancolle.getWorldServer(gadgetInfo, function(error, isNewPlayer, server) {
				assert.isNull(error, 'there should be no error');
				assert.isTrue(isNewPlayer, 'should indicate that this player does not exist in the server');
				assert.deepEqual(server, Kancolle, 'should return the game itself');
				done();
			});
		})

		it('return associated child server if player is old', function(done) {
			var gadgetInfo = {VIEWER_ID: apiTerminal.oldPlayer};
			Kancolle.getWorldServer(gadgetInfo, function(error, isNewPlayer, server) {
				if(error) done(error);

				assert.isNull(error, 'there should be no error');
				assert.isFalse(isNewPlayer, 'should indicate that this player does not exist in the server');
				assert.include(kancolleServerIpArray, server.host, 'should be in one of the Kancolle children servers');
				done();
			});
		})

		it('should return error when internal error occurred in the target server', sinon.test(function(done) {
			var error = {api_data: 0};
			var errorResponse = 'svdata=' + JSON.stringify(error);
			this.stub(rp, 'get').returns({
				then: function(bodyCallback) { bodyCallback(errorResponse); return this;},
				catch: function() {}
			})

			Kancolle.getWorldServer({}, function(error, isNewPlayer, server) {
				assert.isNotNull(error);
				assert.isUndefined(isNewPlayer);
				assert.isUndefined(server);
				done();
			});
		}))
	})
})

