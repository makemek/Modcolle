'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const dmmAuthenticator = require('../middleware/dmm-passport');
const osapi = require('../dmm/osapi');
const kancolle = require('../kancolle/')

router.get('/', function (req, res, next) {
	if(!req.isAuthenticated())
		return res.render('index');

	osapi.getGameInfo(kancolle.appId, req.user)
	.then(kancolle.launch)
	.then(url => {
		return res.render('kancolle', {flashUrl: url});
	})
	.catch(next);
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/'
}))

module.exports = exports = router;