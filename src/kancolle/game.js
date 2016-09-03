'use strict';

const rp = require('request-promise');
const appLog = require('winston').loggers.get('app');
const sprintf = require('sprintf-js').sprintf;

var Kancolle = {

	ENTRY_IP: '203.104.209.7',

	fetchConfig: function() {
		var promisify = (resolve, reject) => {
			var options = {
				url: 'http://' + this.ENTRY_IP + '/gadget/js/kcs_const.js'
			}

			appLog.info('load scripts from ' + options.url);
			rp.get(options)
			.then(jsCode => {
				appLog.verbose('append js code to output variable value');
				var var2export = sprintf("JSON.stringify({%s, %s, %s})", 
					'ConstServerInfo', 'ConstURLInfo', 'MaintenanceInfo')
				jsCode += ';' + var2export;

				appLog.info('emulate javascripts assuming that code from ' + options.url + ' is trusted');
				var json = JSON.parse(eval(jsCode));
				appLog.debug('parsed json result');
				appLog.debug(json);
				return resolve(json);
			});
		}

		return new Promise(promisify);
	},

	getMaintenanceInfo: function() {
		var promisify = (resolve, reject) => {
			this.fetchConfig()
			.then(kcs_config => {
				var maintenanceInfo = kcs_config.MaintenanceInfo;
				var isMaintain = Boolean(maintenanceInfo.IsDoing) || Boolean(maintenanceInfo.IsEmergency);
				maintenanceInfo.isMaintain = isMaintain;
				delete maintenanceInfo.IsDoing;
				delete maintenanceInfo.IsEmergency;
				return resolve(maintenanceInfo);
			})
		}

		return new Promise(promisify);
	},

	getWorldServerId: function(gadgetInfo) {
		var promisify = function(resolve, reject) {
			var options = {
				uri: sprintf('http://%s/kcsapi/api_world/get_id/%s/1/%d', this.ENTRY_IP, gadgetInfo.VIEWER_ID, Date.now()),
			}
			appLog.verbose('request to %s', options.uri);
			appLog.debug('options', options);
			rp.get(options)
			.then(response => {
				appLog.verbose('response received from %s', options.uri);
				appLog.debug('response', response);

				appLog.verbose('remove "svndata=" and parse JSON');
				response = response.replace('svdata=', '');
				response = JSON.parse(response);
				appLog.debug('parsed result', response);

				if(response.api_result != 1) {
					var error = new Error('Internal error at target server %s', this.ENTRY_IP);
					appLog.error(error.message);
					return reject(error);
				}

				var worldId = response.api_data.api_world_id;
				appLog.verbose('player id %d resides in world id %d', gadgetInfo.VIEWER_ID, worldId);
				return resolve(worldId);
			})
		}.bind(this);

		return new Promise(promisify);
	}
}

module.exports = exports = Kancolle;
