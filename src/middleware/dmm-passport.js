'use strict'

const dmmAgent = require('../dmm/agent')
const CookieInjector = require('../dmm/cookie-injector')
const tough = require('tough-cookie')
const Cookie = tough.Cookie

var auth = {}

auth.authenticate = function(username, password, done) {
  dmmAgent.login(username, password)
  .then(function(cookie) {
    return done(null, cookie)
  })
  .catch(done)
}

auth.serialize = function(dmmCookies, done) {
  var session = dmmCookies.filter(function(cookie) {
    cookie = Cookie.parse(cookie)
    return cookie.key === 'INT_SESID'
  })

  if(!session.length)
    return done(new Error('no session cookie found (INT_SESID)'))
  if(session.length > 1)
    return done(new Error('only 1 session cookie is allowed'))

  session = session[0]
  session = injectCookies(session, ['/', '/netgame/', '/netgame_s/'])
  return done(null, session.join(';'))

  function injectCookies(session, subdomains) {
    var injector = new CookieInjector([session], subdomains)
    injector.language(CookieInjector.language.japan)
    injector.revokeRegionRestriction()
    return injector.cookies
  }
}

auth.deserialize = function(dmmSession, done) {
  done(null, dmmSession)
}

auth.isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    return next()
  res.redirect('/')
}

module.exports = exports = auth