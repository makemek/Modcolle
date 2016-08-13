'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const settings = require('nconf');
const moment = require('moment-timezone');
const expressLog = require('winston').loggers.get('express');
const passport = require('passport');
const dmmAuthenticator = require('../middleware/dmm-passport');

router.get('/', function (req, res) {
	expressLog.info('GET: ' + req.url);
	res.render('index', {
		API_TOKEN: settings.get('API_TOKEN'),
		API_START_TIME: currentJapanUnixTime()
	})
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/kancolle',
	failureRedirect: '/'
}))

router.get('/kancolle', dmmAuthenticator.isAuthenticated, function(req, res) {
	res.send(req.user);
})

function currentJapanUnixTime() {
	var timezone = 'Japan';

	var today = new Date();
	var todayStamp = today.toISOString();
	var datetimeMs = todayStamp.replace(/-|:|Z/g, '');

	return moment.tz(datetimeMs, timezone).format('x');
}

module.exports = exports = router;