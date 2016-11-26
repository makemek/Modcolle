'use strict'

const sprintf = require('sprintf-js').sprintf
const rp = require('request-promise')
const log = require('../logger')('service:dmm')

const API = {
  getGameInfo: function(gameId, dmmCookies) {
    const url = `http://www.dmm.com/netgame/social/-/gadgets/=/app_id=${gameId}`
    let cookies = dmmCookies

    if(Array.isArray(dmmCookies))
      cookies = cookies.join('; ')

    const options = {
      uri: url,
      headers: {cookie: cookies}
    }
    log.info(`request game metadata from ${url}`)
    return rp.get(options)
    .then(htmlBody => {
      log.info(`search for gadgetInfo inside HTML ${url}`)
      const gadgetInfo = getGadgetInfo(htmlBody)

      if(!gadgetInfo) {
        const error = new Error('gadget info not found')
        log.error(error.message)
        return Promise.reject(error)
      } else {
        return Promise.resolve(gadgetInfo)
      }
    })
  },

  /**
   * Callback function for performing http request
   *
   * @callback proxyRequestCallback
   * @param {null|object} error
   * @param {object} response - parsed JSON response
   * {
   *  "body": #response
   *  "headers": #headers
   *  "rc": #status
   * }
   * where
   * #response is the response from a the target url
   * #headers are http response header from the target server
   * #status is the http status code from the target server
   */

  /**
   * Carry out proxy http GET request to DMM server
   * Where DMM will forward request to the destinated url with OAuth 1.0 authentication
   *
   * @param {string} target url - destinated url
   * @param {object} gadgetInfo - gadget information aquired from accessing DMM net game page
   * @param {proxyRequestCallback} done - a callback function
   */
  proxyRequest: function(targetUrl, gadgetInfo) {
    const payload = {
      url: targetUrl,
      st: gadgetInfo.ST,
      authz: 'signed',
      signOwner: true
    }
    const options = {
      url: 'http://osapi.dmm.com/gadgets/makeRequest',
      form: payload
    }

    log.info('proxy request to %s', targetUrl)
    return rp.post(options)
    .then(response => {
      log.info('unwrap response from %s', options.url)
      log.verbose(response)

      const wrapper = 'throw 1; < don\'t be evil\' >'
      log.debug('remove response wrapper (%s)', wrapper)
      let dmmResponse = response.slice(response.search(wrapper) + wrapper.length)
      log.debug(dmmResponse)

      log.debug('extract raw body')
      const startBody = '"body":"', endBody = '","headers":'
      const rawBody = dmmResponse.slice(dmmResponse.search('"body":"') + startBody.length, dmmResponse.search(endBody, -1))
      log.debug('rawbody', rawBody)

      log.debug('replace body with escape strings')
      dmmResponse = dmmResponse.replace(rawBody, escape(rawBody))

      log.debug('convert to JSON format')
      const jsonDmmResponse = JSON.parse(dmmResponse)
      const urlWrapperKeyName = Object.keys(jsonDmmResponse)[0]
      log.debug('unwrap JSON property %s', urlWrapperKeyName)
      const targetResponse = jsonDmmResponse[urlWrapperKeyName]

      log.debug('unescape body')
      targetResponse.body = unescape(targetResponse.body)

      log.info(`successfully get ${targetUrl} raw response`, targetResponse)
      return Promise.resolve(targetResponse)
    })
  }
}

function getGadgetInfo(htmlString) {
  log.verbose('get unparsed json from variable gadgetInfo')
  const varName = 'gadgetInfo = '
  let gadgetInfo = htmlString.match(new RegExp(varName + '{([^}]*)}', 'g'))
  if(!gadgetInfo)
    return null
  else
    gadgetInfo = gadgetInfo[0]

  log.debug(sprintf('remove prefix "%s"', varName))
  gadgetInfo = gadgetInfo.replace(varName, '')
  log.debug(gadgetInfo)

  log.debug('get variable name')
  const varList = gadgetInfo.match(/\w+ /g)
  log.debug(varList)

  log.debug('put double quotes around the variable')
  varList.forEach(property => {
    property = property.trim()
    gadgetInfo = gadgetInfo.replace(property, sprintf('"%s"', property))
  })
  log.debug(gadgetInfo)

  log.debug('convert to json')
  gadgetInfo = JSON.parse(gadgetInfo)
  log.debug(gadgetInfo)

  return gadgetInfo
}

module.exports = API
