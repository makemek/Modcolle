'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const API_TOKEN = process.env.API_TOKEN;
const moment = require('moment-timezone');
const passport = require('passport');
const dmmAuthenticator = require('../middleware/dmm-passport');

router.get('/', function (req, res) {
	res.render('index', {
		API_TOKEN: API_TOKEN,
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