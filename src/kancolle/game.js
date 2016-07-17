'use strict';

const inherit = require('inherit');
const DmmGameAbstrct = require('../dmm/game');
const rp = require('request-promise');
const appLog = require('winston').loggers.get('app');
const Sandbox = require('sandbox');

var Kancolle = {

	_getAppId: function() {
		return 854854;
	},

	fetchConfig: function(done) {
		var options = {
			url: 'http://203.104.209.7/gadget/js/kcs_const.js'
		}

		appLog.info('load scripts from ' + options.url);
		rp.get(options).then(function(jsCode) {
			appLog.verbose('append js code to output variable value');
			jsCode += '; JSON.stringify({ConstServerInfo, ConstURLInfo, MaintenanceInfo})';

			appLog.info('emulate javascript ' + options.url + ' inside a sandbox environment');
			var sandbox = new Sandbox();
			sandbox.run(jsCode, function(output) {
				var result = output.result;
				result = result.substring(1, result.length - 1);
				appLog.debug('output result');
				appLog.debug(result);
				
				done(null, JSON.parse(result));
			})
		}).catch(done)
	},

	isOnMaintenance(done) {
		this.fetchConfig(function(error, kcs_config) {
			var maintenanceInfo = kcs_config.MaintenanceInfo;
			var isMaintain = Boolean(maintenanceInfo.IsDoing) || Boolean(maintenanceInfo.IsEmergency);
			done(error, isMaintain);
		})
	}
}

module.exports = exports = inherit(DmmGameAbstrct, Kancolle);
