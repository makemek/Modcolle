'use strict'

const dmmAgent = require('./dmm/agent')
const errors = require('./errors')
const Cookie = require('tough-cookie').Cookie
const CookieInjector = require('./dmm/cookie-injector')
const osapi = require('./dmm/osapi')
const log = require('./logger')('service:dmm')
const kancolle = require('./kancolle/')

module.exports = {
  dmmAccount,
  dmmSession
}

function dmmAccount(username, password, done) {
  dmmAgent.login(username, password)
  .then(cookies => {
    cookies = cookies.map(Cookie.parse)
    const session = cookies.find(cookie => cookie.key === 'INT_SESID').value
    dmmSession(session, null, done)
  })
  .catch(done)
}

function dmmSession(session, _, done) {
  const cookies = _injectCookies(`INT_SESID=${session}`, ['/', '/netgame/', '/netgame_s/'])
  log.info(`OSAPI: get DMM game metadata of app id ${kancolle.appId}`)
  osapi.getGameInfo(kancolle.appId, cookies)
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
  log.verbose('set DMM to display language in Japanese')
  injector.language(CookieInjector.language.japan)
  log.verbose('revoke region restriction')
  injector.revokeRegionRestriction()
  return injector.cookies
}
