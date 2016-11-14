'use strict'

const dmmAgent = require('../dmm/agent')
const CookieInjector = require('../dmm/cookie-injector')
const tough = require('tough-cookie')
const Cookie = tough.Cookie
const log = require('../logger')('app:middleware')

const auth = {}

auth.authenticate = function(username, password, done) {
  log.info(`authenticate ${username}`)
  dmmAgent.login(username, password)
  .then(cookie => {
    return done(null, cookie)
  })
  .catch(done)
}

auth.serialize = function(dmmCookies, done) {
  log.info('serialize DMM cookie INT_SESSID as a login session')
  let session = dmmCookies.filter(cookie => {
    cookie = Cookie.parse(cookie)
    return cookie.key === 'INT_SESID'
  })

  if(!session.length)
    return done(new Error('no session cookie found (INT_SESID)'))
  if(session.length > 1)
    return done(new Error('only 1 session cookie is allowed'))

  const dmmSubDomains = ['/', '/netgame/', '/netgame_s/']
  session = session[0]
  log.info(`apply DMM subdomain ${dmmSubDomains} to DMM session cookie INT_SESSID in order to have access to those sub domains`)
  session = injectCookies(session, dmmSubDomains)
  return done(null, session.join(';'))
}

function injectCookies(session, subdomains) {
  const injector = new CookieInjector([session], subdomains)
  log.verbose('set DMM to display language in Japanese')
  injector.language(CookieInjector.language.japan)
  log.verbose('revoke region restriction')
  injector.revokeRegionRestriction()
  return injector.cookies
}

auth.deserialize = function(dmmSession, done) {
  log.info('deserialize session')
  done(null, dmmSession)
}

auth.isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    return next()
  res.redirect('/')
}

module.exports = auth
