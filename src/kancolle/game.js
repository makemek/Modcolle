'use strict';

const inherit = require('inherit');
const DmmGameAbstrct = require('../dmm/game');
const rp = require('request-promise');

var Kancolle = {

	_getAppId: function() {
		return 854854;
	},

	isOnMaintenance(done) {
		var options = {
			url: 'http://203.104.209.7/gadget/js/kcs_const.js'
		}
		rp.get(options).then(function(body) {
			var infoPlainText = body.match(/MaintenanceInfo\..*/g);
			var infoJson = asJson(infoPlainText, 'MaintenanceInfo');
			done(null, infoJson)
		}).catch(done)
	}
}

function asJson(setterAssignmentLines, setterVarName) {
	var infoJsonPlain = '{' + 
			setterAssignmentLines.replace(setterVarName + '.', '')
			.replace(';', '')
			.replace('=', ':') +
		'}';

	varList = setterAssignmentLines.match(/\w+ /g);
	varList.forEach(function(property) {
		property = property.trim();
		setterAssignmentLines.replace(property, '"' + property + '"');
	})

	return JSON.parse(setterAssignmentLines);
}

module.exports = exports = inherit(DmmGameAbstrct, Kancolle);
