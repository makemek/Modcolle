'use strict';

const inherit = require('inherit');
const DmmGameAbstrct = require('../dmm/game');
const rp = require('request-promise');
const appLog = require('winston').loggers.get('app');
const sprintf = require('sprintf-js').sprintf

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
	}
}

module.exports = exports = inherit(DmmGameAbstrct, Kancolle);
