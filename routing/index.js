'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const settings = require('nconf');
const moment = require('moment-timezone');

router.get('/', function (req, res) {
	res.render('index', {
		API_TOKEN: settings.get('API_TOKEN'),
		API_START_TIME: currentJapanUnixTime()
	})
});

function currentJapanUnixTime() {
	var timezone = 'Japan';

	var today = new Date();
	var todayStamp = today.toISOString();
	var datetimeMs = todayStamp.replace(/-|:|Z/g, '');

	return moment.tz(datetimeMs, timezone).format('x');
}

module.exports = exports = router;