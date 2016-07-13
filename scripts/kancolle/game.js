'use strict';

const inherit = require('inherit');
const DmmGameAbstrct = require('../dmm/game');

var Kancolle = {

	_getAppId: function() {
		return 854854;
	}

}

module.exports = exports = inherit(DmmGameAbstrct, Kancolle);
