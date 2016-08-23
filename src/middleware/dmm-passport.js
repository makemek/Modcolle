'use strict';

const dmmAgent = require('../dmm/agent');
const CookieInjector = require('../dmm/cookie/injector');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;

var auth = {};

auth.authenticate = function(username, password, done) {
	dmmAgent.login(username, password, done);
}

auth.serialize = function(dmmCookies, done) {
	var session = dmmCookies.filter(function(cookie) {
		cookie = Cookie.parse(cookie);
		return cookie.key === 'INT_SESID';
	})

	if(!session.length)
		return done(new Error('no session cookie found (INT_SESID)'));
	if(session.length > 1)
		return done(new Error('only 1 session cookie is allowed'));

	done(null, session[0]);
}

auth.deserialize = function(dmmSession, done) {
	var injector = new CookieInjector([dmmSession], ['/', '/netgame/', '/netgame_s/']);
	injector.language(CookieInjector.language.japan);
	injector.revokeRegionRestriction();
	var cookies = injector.cookies;

	done(null, cookies);
}

auth.isAuthenticated = function(req, res, next) {
	if(req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = exports = auth;