'use strict'

const request = require('request')
const rp = require('request-promise')
const urljoin = require('url-join')
const urlparse = require('url-parse')
const agentLog = require('winston').loggers.get('agent')
const osapi = require('../../dmm/osapi')
const sprintf = require('sprintf-js').sprintf

class KancolleServer {

  constructor(worldId, host) {
    this.worldId = worldId
    this.host = host
  }

  download(url) {
    agentLog.info('Download: ' + url)
    agentLog.verbose('Remove sensitive data in URL parameters')
    const parsedUrl = removeUrlParameterSensitiveData(url)
    agentLog.debug('Parsed URL: ' + parsedUrl)

    return request.get({
      url: parsedUrl,
      headers: {'x-requested-with': 'ShockwaveFlash/22.0.0.192'}
    })
  }

  apiRequest(apiUrl, payload, initialHttpHeaders) {
    const fullUrl = urljoin(this.host, apiUrl)
    agentLog.info('call Kancolle API', fullUrl)
    const options = {
      url: fullUrl,
      form: payload,
      headers: forgeKancolleHttpRequestHeader(fullUrl, initialHttpHeaders),
      gzip: true
    }
    agentLog.debug('POST options', options)
    return rp.post(options)
  }

  generateApiToken(gadgetInfo) {
    const url = sprintf('%s/kcsapi/api_auth_member/dmmlogin/%s/1/%d', this.host, gadgetInfo.VIEWER_ID, Date.now())
    return osapi.proxyRequest(url, gadgetInfo).then(response => {
      let body = response.body
      body = body.replace('svdata=', '')
      body = body.replace(/\\/g, '')
      const apiResponse = JSON.parse(body)
      const isBan = apiResponse.api_result == 301

      const data = {
        isBan: isBan,
        api_token: apiResponse.api_token,
        api_start_time: apiResponse.api_starttime
      }
      return Promise.resolve(data)
    })
  }
}

function forgeKancolleHttpRequestHeader(fullUrl, initialHttpHeaders) {
  initialHttpHeaders = initialHttpHeaders || {}
  agentLog.verbose('Forge HTTP header to match with HTTP request from browser')
  agentLog.debug('URL', fullUrl)
  const headers = initialHttpHeaders
  modifyHeader(fullUrl)
  avoidSocketHangup()

  return headers

  function avoidSocketHangup() {
    delete headers['connection']
    delete headers['content-length']
    delete headers['content-type']
  }

  function modifyHeader(fullUrl) {
    const url = urlparse(fullUrl)
    headers.host = url.host
    headers.origin = url.origin

    delete headers['referer']
    headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36'
    agentLog.debug('modified http headers', headers)
  }
}

function removeUrlParameterSensitiveData(url) {
  url = urlparse(url, true)
  delete url.query.api_token
  delete url.query.api_starttime

  return url.toString()
}

module.exports = exports = KancolleServer
