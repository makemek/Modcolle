'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const dmmAuthenticator = require('../middleware/dmm-passport');

router.get('/', function (req, res, next) {
	if(!req.isAuthenticated())
		return res.render('index');
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/'
}))

module.exports = exports = router;