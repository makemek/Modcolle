'use strict'

/**
 * Handle Kancolle requests to external resources
 **/

const express = require('express')
const router = express.Router()
const path = require('path')
const validator = require('validator')
const urljoin = require('url-join')
const kancolle = require('../kancolle/')
const appLog = require('winston').loggers.get('app')

/**
 * Handle http GET request to server flag image
 * First, it will look file in a directory reflected by its uri
 * If file is not found, it will request the file from kancolle server
 *
 * When kancolle request for server image
 * It requests the following format http://<server>/kcs/resources/image/world/<world>_t.png
 * <server> is the player's server host name or ip address
 * <world> is a file name generated from <server> string
 *
 * If <server> is an ip address, <world> replace '.' with '_' and include 3 zerofills.
 * For example, 1.1.11.111 will be 001_001_011_111, 1.2.3.4 will be 001_002_003_004
 * If <server> is a host name, <world> replace '.' with '_' only
 * For example, www.example.com becomes www_example_com
 **/
const WOLRD_IMG_URL = 'resources/image/world'
router.get('/' + WOLRD_IMG_URL + '/:worldImg', (req, res, next) => {
  appLog.info('convert image name ' + req.params.worldImg + ' to acceptable format')
  const host = getHost(req.params.worldImg)
  const targetServer = kancolle.getServer(host)
  if(!targetServer) {
    appLog.info(host + ' does not exist in any kancolle server host name')
    return res.sendStatus(400)
  }
  //TODO try loading from disk before downloading Kancolle server
  const url = urljoin(targetServer.host, req.originalUrl)
  appLog.info('donwload server image logo from ' + url)

  const proxyRequest = targetServer.download(url)
  proxyRequest.on('error', next)
  proxyRequest.on('response', () => {
    appLog.info('connected to ' + url)
  })
  proxyRequest.on('end', () => {
    appLog.info('terminate connection ' + url)
  })

  proxyRequest.pipe(res)
})

function getHost(worldImageFilename) {
  let host
  const trailoutString = '_t.png'
  const basename = path.basename(worldImageFilename, trailoutString)
  appLog.debug('trail out ' + trailoutString, basename)
  const ipStrip = basename.split('_').map(Number).join('.')
  if(validator.isIP(ipStrip)) {
    host = ipStrip
    appLog.verbose(worldImageFilename + 'is an ip address', host)
  } else {
    host = basename.split('_').join('.')
    appLog.verbose(worldImageFilename + 'is a hostname', host)
  }
  return host
}

/**
 * Handle any http GET for any file that have the extension of swf, mp3, or png
 * First, it will look file in a directory reflected by its uri
 * If file is not found, it will request the file from kancolle server
 **/
const urlEndWithFileType = /^.*\.(swf|mp3|png)$/i
router.get(urlEndWithFileType, (req, res) => {
  appLog.info('received request for kancolle asset', req.originalUrl)
  const kancolleServer = kancolle.getServer(1)
  appLog.info('get kancolle server', kancolleServer.host)
  if(!kancolleServer) {
    appLog.error('kancolle server not found')
    return res.sendStatus(500)
  }
  const fileStream = kancolleServer.download(urljoin(kancolleServer.host, req.originalUrl))
  return fileStream.pipe(res)
})

module.exports = router
