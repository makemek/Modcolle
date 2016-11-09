'use strict'

const express = require('express')
const router = express.Router()
const passport = require('passport')
const osapi = require('../dmm/osapi')
const kancolle = require('../kancolle/')
const URL = require('url-parse')
const urljoin = require('url-join')

router.get('/', (req, res, next) => {
  if(!req.isAuthenticated())
    return res.render('index')

  osapi.getGameInfo(kancolle.appId, req.user)
  .then(kancolle.launch)
  .then(routeTraffic)
  .then(url => {
    return res.render('kancolle', {flashUrl: url})
  })
  .catch(next)

  function routeTraffic(url) {
    const TARGET_FILE = 'mainD2.swf'
    url = new URL(url, true)
    const isTargetFile = url.pathname.includes(TARGET_FILE)
    if(!isTargetFile)
      return url.toString()

    const server = kancolle.getServer(url.hostname)
    const apiTokenWithExtraEmbededInfo = [server.worldId, url.query.api_token].join('_') // embed player's info so that any API POST request from flash will contain this information
    const interceptedUrl = urljoin(
      url.pathname, // remove hostname from flash url so that it makes http request to this site
      '?api_token=' + apiTokenWithExtraEmbededInfo,
      '?api_starttime=' + url.query.api_starttime)

    return Promise.resolve(interceptedUrl)
  }
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/'
}))

module.exports = router
