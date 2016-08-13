'use strict';

const dmmAgent = require('../dmm/agent');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;

var auth = {};

auth.authenticate = function(username, password, done) {
	dmmAgent.login(username, password, function(error, dmmCookies) {
		if(error)
			return done(error);
		done(null, dmmCookies);
	});
}

auth.serialize = function(dmmCookies, done) {
	var session = dmmCookies.filter(function(cookie) {
		cookie = Cookie.parse(cookie);
		return cookie.key === 'INT_SESID';
	})

	done(null, session);
}

auth.deserialize = function(dmmSession, done) {
	done(null, dmmSession);
}

auth.isAuthenticated = function(req, res, next) {
	if(req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = exports = auth;