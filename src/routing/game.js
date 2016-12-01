'use strict'

const express = require('express')
const router = express.Router()
const passport = require('passport')
const osapi = require('../dmm/osapi')
const kancolle = require('../kancolle/')
const URL = require('url-parse')
const urljoin = require('url-join')
const log = require('../logger')('app:router')
const dmmPassport = require('../middleware/dmm-passport')
const Cookie = require('tough-cookie').Cookie

router.get('/', (req, res) => {
  res.render('index')
})

router.post('/dmm-account', passport.authenticate('local', {
  failureRedirect: '/',
  session: false
}), (req, res, next) => {
  const dmmCookies = req.user.map(Cookie.parse)
  req.body.dmm_session = dmmCookies.find(cookie => cookie.key === 'INT_SESID').value
  next()
}, loginByDmmSession)

router.post('/dmm-session', loginByDmmSession)

function loginByDmmSession(req, res, next) {
  dmmPassport.serialize([`INT_SESID=${req.body.dmm_session}`], (error, cookies) => {
    log.info(`OSAPI: get DMM game metadata of app id ${kancolle.appId}`)
    osapi.getGameInfo(kancolle.appId, cookies)
    .then(kancolle.launch)
    .then(redirectKancolleNetworkTraffic)
    .then(url => {
      log.info('render HTML template "kancolle" with Kancolle game url')
      return res.render('kancolle', {flashUrl: url})
    })
    .catch(next)
  })
}

function redirectKancolleNetworkTraffic(url) {
  const TARGET_FILE = 'mainD2.swf'
  log.info(`configure command line args of ${TARGET_FILE} to make HTTP request to Modcolle`)

  url = new URL(url, true)
  const isTargetFile = url.pathname.includes(TARGET_FILE)
  if(!isTargetFile) {
    log.info(`${url.pathname} doesn't include ${TARGET_FILE}. Fallback to old url`)
    return url.toString()
  }

  const server = kancolle.getServer(url.hostname)
  const apiTokenWithExtraEmbededInfo = [server.worldId, url.query.api_token].join('_') // embed player's info so that any API POST request from flash will contain this information

  log.verbose(`remove host name ${url.hostname} from url`)
  const interceptedUrl = urljoin(
    url.pathname, // remove hostname from flash url so that it makes http request to this site
    `?api_token=${apiTokenWithExtraEmbededInfo}`,
    `?api_starttime=${url.query.api_starttime}`)

  return Promise.resolve(interceptedUrl)
}

module.exports = router
