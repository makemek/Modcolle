'use strict';

const rp = require('request-promise');
const appLog = require('winston').loggers.get('app');
const sprintf = require('sprintf-js').sprintf;
const childServer = require('./server/');

var Kancolle = {

	ENTRY_IP: '203.104.209.7',
	appId: 854854,

	fetchConfig: function(done) {
		var options = {
			url: 'http://' + this.ENTRY_IP + '/gadget/js/kcs_const.js'
		}

		appLog.info('load scripts from ' + options.url);
		rp.get(options).then(function(jsCode) {
			appLog.verbose('append js code to output variable value');
			var var2export = sprintf("JSON.stringify({%s, %s, %s})", 
				'ConstServerInfo', 'ConstURLInfo', 'MaintenanceInfo')
			jsCode += ';' + var2export;

			appLog.info('emulate javascripts assuming that code from ' + options.url + ' is trusted');
			var json = JSON.parse(eval(jsCode));
			appLog.debug('parsed json result');
			appLog.debug(json);
			done(null, json);
		}).catch(done)
	},

	getMaintenanceInfo(done) {
		this.fetchConfig(function(error, kcs_config) {
			var maintenanceInfo = kcs_config.MaintenanceInfo;
			var isMaintain = Boolean(maintenanceInfo.IsDoing) || Boolean(maintenanceInfo.IsEmergency);
			maintenanceInfo.isMaintain = isMaintain;
			delete maintenanceInfo.IsDoing;
			delete maintenanceInfo.IsEmergency;
			done(error, maintenanceInfo);
		})
	},

	getWorldServer: function(gadgetInfo, done) {
		var self = this;
		var options = {
			uri: sprintf('http://%s/kcsapi/api_world/get_id/%s/1/%d', self.ENTRY_IP, gadgetInfo.VIEWER_ID, Date.now()),
		}
		appLog.verbose('request to %s', options.uri);
		appLog.debug('options', options);
		rp.get(options).then(function(response) {
			appLog.verbose('response received from %s', options.uri);
			appLog.debug('response', response);

			appLog.verbose('remove "svndata=" and parse JSON');
			response = response.replace('svdata=', '');
			response = JSON.parse(response);
			appLog.debug('parsed result', response);

			if(response.api_result != 1) {
				var error = new Error('Internal error at target server %s', self.ENTRY_IP);
				appLog.error(error.message);
				return done(error);
			}

			var worldId = response.api_data.api_world_id;
			if(!worldId) {
				appLog.verbose('new player (world ID = %d)', worldId);
				return done(null, true, self);
			}
			else {
				appLog.verbose('old player (world ID = %d)', worldId);

				var associatedServer = childServer['World_' + worldId];
				appLog.verbose('get associated server host %s', associatedServer.host);
				return done(null, false, associatedServer);
			}
		})
		.catch(done)
	}
}

module.exports = exports = Kancolle;
