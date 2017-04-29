'use strict'

const express = require('express')
const router = express.Router()
const log = require('../../logger')('app:router')
const kancolle = require('../../kancolle/')

router.post('/*', extractWorldIdFromApiToken, (req, res, next) => {
  const server = kancolle.getServer(req.body.worldId)
  if(!server) {
    log.info(`server id '${req.body.worldId}' does not match with any identifier. Send HTTP status code 400`)
    return res.sendStatus(400)
  }

  log.debug(`remove worldId ${req.body.worldId} from payload`)
  delete req.body.worldId

  log.info(`call Kancolle host ${server.host} with API ${req.originalUrl}`)
  server
  .apiRequest(req.originalUrl, req.body, req.headers)
  .then(apiResponse => {
    apiResponse = apiResponse.replace('svdata=', '')
    apiResponse = JSON.parse(apiResponse)
    log.debug(`${server.host} API ${req.originalUrl} respond %j`, apiResponse)
    res.json(apiResponse)
  })
  .catch(next)
})

function extractWorldIdFromApiToken(req, res, next) {
  const api_token = req.body.api_token
  if(!api_token) {
    log.info('api_token does not present in HTTP request', req.originalUrl, req.headers)
    return res.sendStatus(400)
  }

  const delimiter = '_'
  log.debug(`looking for server id by splitting api_token using '${delimiter}' as a delimiter`)
  const extraInfos = api_token.split(delimiter)
  if(extraInfos.length == 1) {
    log.info(`splitting api_token using '${delimiter}', found only api_token. Modcolle requires server id in front of api_token. Send HTTP status code 400`)
    return res.sendStatus(400)
  }

  log.debug('extract id from api token assuming that id comes before api token')
  req.body.worldId = extraInfos[0]
  req.body.api_token = extraInfos[1]
  return next()
}

module.exports = router
