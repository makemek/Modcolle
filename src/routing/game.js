'use strict'

const express = require('express')
const router = express.Router()
const passport = require('passport')
const kancolle = require('../kancolle/')
const URL = require('url-parse')
const urljoin = require('url-join')
const log = require('../logger')('app:router')

router.post('/dmm-account', passport.authenticate('dmm-account', {
  failureRedirect: '/',
  session: false
}), launchKancolle)

router.post('/dmm-session', passport.authenticate('dmm-session', {
  failureRedirect: '/',
  session: false
}), launchKancolle)

function launchKancolle(req, res, next) {
  kancolle.launch(req.user)
  .then(redirectKancolleNetworkTraffic)
  .then(url => res.json({flashUrl: url}))
  .catch(next)
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

  log.debug(`remove host name ${url.hostname} from url`)
  const interceptedUrl = urljoin(
    url.pathname, // remove hostname from flash url so that it makes http request to this site
    `?api_token=${apiTokenWithExtraEmbededInfo}`,
    `?api_starttime=${url.query.api_starttime}`)

  return Promise.resolve(interceptedUrl)
}

module.exports = router
