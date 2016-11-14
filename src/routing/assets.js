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
const log = require('../logger')('app:router')

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
router.get('/resources/image/world/:worldImg', (req, res, next) => {
  log.info(`convert image name ${req.params.worldImg} from DASH to DOT format`, req.headers)
  const host = getHost(req.params.worldImg)
  const targetServer = kancolle.getServer(host)
  if(!targetServer) {
    log.info(`${host} does not match with any kancolle server host name. Send HTTP status code 400`)
    return res.sendStatus(400)
  }
  //TODO try loading from disk before downloading Kancolle server
  const url = urljoin(targetServer.host, req.originalUrl)
  log.info(`download server image logo from ${url}`)

  const proxyRequest = targetServer.download(url)
  proxyRequest.on('error', next)
  proxyRequest.on('response', () => {
    log.verbose(`connected to ${url}`)
  })
  proxyRequest.on('end', () => {
    log.info(`pipe ${url} to client completed`)
    log.verbose(`terminate connection ${url}`)
  })

  proxyRequest.pipe(res)
})

function getHost(worldImageFilename) {
  let host
  const trailoutString = '_t.png'
  const basename = path.basename(worldImageFilename, trailoutString)
  log.debug(`trail out ${trailoutString} from ${basename}`)
  const ipStrip = basename.split('_').map(Number).join('.')
  if(validator.isIP(ipStrip)) {
    host = ipStrip
    log.verbose(`${worldImageFilename} 'is an ip address. Resolved as ${host}`)
  } else {
    host = basename.split('_').join('.')
    log.verbose(`${worldImageFilename} 'is a hostname. Resolved as ${host}`)
  }
  return host
}

/**
 * If nginx is running using configuration file in deployment/nginx/nginx.conf, this function will not be run.
 * Handle any http GET for any file that have the extension of swf, mp3, or png
 * First, it will look file in a directory reflected by its uri
 * If file is not found, it will request the file from kancolle server
 **/
router.get(/^.*\.(swf|mp3|png)$/i, (req, res) => {
  const kancolleServer = kancolle.getServer(1)
  if(!kancolleServer) {
    log.error('kancolle server not found')
    return res.sendStatus(500)
  }
  log.info(`pipe ${req.originalUrl} from ${kancolleServer.host}`)
  const fileStream = kancolleServer.download(urljoin(kancolleServer.host, req.originalUrl))
  return fileStream.pipe(res)
})

module.exports = router
