'use strict'

const inherit = require('inherit')
const log = require('../logger')('service:dmm')
const tough = require('tough-cookie')
const Cookie = tough.Cookie

const Injector = {

  __constructor: function(cookies, subdomains) {
    cookies = cookies || []
    subdomains = subdomains || ['/']

    cookies = cookies.map(Cookie.parse)

    this.cookies = cookies
    this.subdomains = subdomains
    this.domain = 'dmm.com'
  },

  revokeRegionRestriction: function() {
    const targetCookie = {key: 'ckcy', value: 1}

    log.info('revoke foriegner (non-japan) access restriction')
    log.verbose('include to original cookie', targetCookie)
    this.cookies = removeAndInjectCookie(this, targetCookie)
    return this.cookies
  }
}

function removeAndInjectCookie(self, targetCookie) {
  let cookies
  log.verbose(`remove cookie ${targetCookie.key}`)
  cookies = removeCookie(self.cookies, targetCookie)
  log.verbose(`${targetCookie.key} include target domain and subdomains`, self.domain, self.subdomains)
  cookies = cookies.concat(generateCookies(targetCookie, [self.domain], self.subdomains))
  return cookies
}

function removeCookie(cookies, targetCookie) {
  cookies = cookies.filter(cookie => {
    return cookie.key != targetCookie.key
  })
  log.debug(cookies)
  return cookies
}

function generateCookies(keyVal, domains, paths) {
  log.debug('create cookies', keyVal, domains, paths)

  const cookies = []
  domains.forEach(domain => {
    paths.forEach(path => {
      const options = keyVal
      options.domain = domain
      options.path = path

      const cookie = new Cookie(options)
      cookies.push(cookie)
    })
  })

  log.debug(cookies)
  return cookies
}

module.exports = inherit(Injector)
