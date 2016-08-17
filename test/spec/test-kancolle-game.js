'use strcit';

const Kancolle = require('../../src/kancolle/game');
const rp = require('request-promise');
const sinon = require('sinon');
const async = require('async');
const sprintf = require('sprintf-js').sprintf;
const apiTerminal = require('../mock/kancolle/api-terminal');
const KancolleChildServers = require('../../src/kancolle/server');

describe('Kancolle game', function() {

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

		it('return world id 0 if player is new', function(done) {
			var gadgetInfo = {VIEWER_ID: apiTerminal.newPlayer};
			Kancolle.getWorldServerId(gadgetInfo, function(error, worldId) {
				if(error)
					return done(error);
				assert.equal(worldId, 0, 'world id should be 0');
				done();
			});
		})

		it('return world id greater than 0 if player is old', function(done) {
			var gadgetInfo = {VIEWER_ID: apiTerminal.oldPlayer};
			Kancolle.getWorldServerId(gadgetInfo, function(error, worldId) {
				if(error)
					done(error);

				assert.isAbove(worldId, 0, 'world id should be greater than 0');
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

			Kancolle.getWorldServerId({}, function(error, isNewPlayer, server) {
				assert.isNotNull(error);
				assert.isUndefined(isNewPlayer);
				assert.isUndefined(server);
				done();
			});
		}))
	})
})

