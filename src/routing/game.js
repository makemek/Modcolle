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

	osapi.getGameInfo(kancolle.appId, req.user, function(error, gadgetInfo) {
		if(error)
			return next(error);
		kancolle.launch(gadgetInfo)
		.then(function(url) {
			res.render('kancolle', {flashUrl: url});
		})
		.catch(next);
	})
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/'
}))

module.exports = exports = router;