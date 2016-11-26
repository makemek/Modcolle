'use strict'

const request = require('request')
const rp = require('request-promise')
const urljoin = require('url-join')
const urlparse = require('url-parse')
const log = require('../../logger')('service:kancolle')
const osapi = require('../../dmm/osapi')

class KancolleServer {

  constructor(worldId, host) {
    this.worldId = worldId
    this.host = host
  }

  download(url) {
    url = removeUrlParameterSensitiveData(url)

    log.info('download asset %s', url)
    return request.get({
      url,
      headers: {'x-requested-with': 'ShockwaveFlash/22.0.0.192'}
    })
  }

  apiRequest(apiUrl, payload, initialHttpHeaders) {
    const fullUrl = urljoin(this.host, apiUrl)
    log.info('call Kancolle API %s', fullUrl)
    const options = {
      url: fullUrl,
      form: payload,
      headers: forgeKancolleHttpRequestHeader(fullUrl, initialHttpHeaders),
      gzip: true
    }
    return rp.post(options)
  }

  generateApiToken(gadgetInfo) {
    const now = Date.now()
    const url = `${this.host}/kcsapi/api_auth_member/dmmlogin/${gadgetInfo.VIEWER_ID}/1/${now}`
    log.info(`${url} generate API token for Kancolle user id ${gadgetInfo.VIEWER_ID}`)
    return osapi.proxyRequest(url, gadgetInfo).then(response => {
      let body = response.body
      body = body.replace('svdata=', '')
      body = body.replace(/\\/g, '')
      const apiResponse = JSON.parse(body)
      const isBan = apiResponse.api_result == 301

      return Promise.resolve({
        isBan: isBan,
        api_token: apiResponse.api_token,
        api_start_time: apiResponse.api_starttime
      })
    })
  }
}

function forgeKancolleHttpRequestHeader(fullUrl, initialHttpHeaders) {
  initialHttpHeaders = initialHttpHeaders || {}
  log.verbose('forge HTTP header as if it comes from a browser')

  let headers = initialHttpHeaders
  headers = asIfInitiateByBrowser(headers, fullUrl)
  headers = avoidSocketHangup(headers)

  return headers

}

function avoidSocketHangup(headers) {
  log.debug('avoid socket hangup', headers)
  delete headers.connection
  delete headers['content-length']
  delete headers['content-type']
  return headers
}

function asIfInitiateByBrowser(headers, fullUrl) {
  const url = urlparse(fullUrl)
  headers.host = url.host
  headers.origin = url.origin

  delete headers.referer
  headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36'
  return headers
}

function removeUrlParameterSensitiveData(url) {
  url = urlparse(url, true)
  delete url.query.api_token
  delete url.query.api_starttime

  return url.toString()
}

module.exports = KancolleServer
