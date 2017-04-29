'use strict'

const log = require('../logger')('service:dmm')
const tough = require('tough-cookie')
const Cookie = tough.Cookie

class Injector {

  constructor(cookies, subdomains) {
    cookies = cookies || []
    subdomains = subdomains || ['/']

    cookies = cookies.map(Cookie.parse)

    this.cookies = cookies
    this.subdomains = subdomains
    this.domain = 'dmm.com'
  }

  revokeRegionRestriction() {
    const targetCookie = {key: 'ckcy', value: 1}

    log.info('revoke foriegner (non-japan) access restriction')
    log.debug('include to original cookie', targetCookie)
    this.cookies = removeAndInjectCookie(this, targetCookie)
    return this.cookies
  }
}

function removeAndInjectCookie(self, targetCookie) {
  let cookies
  log.debug(`remove cookie ${targetCookie.key}`)
  cookies = removeCookie(self.cookies, targetCookie)
  log.debug(`${targetCookie.key} include target domain and subdomains`, self.domain, self.subdomains)
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

module.exports = Injector
