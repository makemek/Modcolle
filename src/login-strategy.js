'use strict'

const dmmAgent = require('./dmm/agent')
const errors = require('./errors')
const CookieInjector = require('./dmm/cookie-injector')
const osapi = require('./dmm/osapi')
const log = require('./logger')('service:dmm')
const kancolle = require('./kancolle/')

module.exports = {
  dmmAccount,
  dmmSession
}

function dmmAccount(username, password, done) {
  dmmAgent.scrapeToken()
  .then(dmmAgent.authorizeToken)
  .then(token => dmmAgent.authenticate(username, password, token))
  .then(session => {
    if(!session)
      return done(null, false)
    return dmmSession(session.value, null, done)
  })
  .catch(done)
}

function dmmSession(session, _, done) {
  const cookies = _injectCookies(`INT_SESID=${session}`, ['/', '/netgame/', '/netgame_s/'])
  log.info(`OSAPI: get DMM game metadata of app id ${kancolle.appId}`)
  return osapi.getGameInfo(kancolle.appId, cookies)
  .then(gadgetInfo => done(null, gadgetInfo))
  .catch(error => {
    if(error instanceof errors.DmmError)
      return done(null, false)
    else
      return done(error)
  })
}

function _injectCookies(session, subdomains) {
  const injector = new CookieInjector([session], subdomains)
  log.verbose('revoke region restriction')
  injector.revokeRegionRestriction()
  return injector.cookies
}
