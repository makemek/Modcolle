'use strict'

const inherit = require('inherit')
const appLog = require('winston').loggers.get('app')
const tough = require('tough-cookie')
const Cookie = tough.Cookie

const languagePreset = {
  language: {
    japan: 'ja',
    english: 'en'
  }
}

const Injector = {

  __constructor: function(cookies, subdomains) {
    cookies = cookies || []
    subdomains = subdomains || ['/']

    appLog.verbose('parse cookie')
    cookies = cookies.map(Cookie.parse)
    appLog.debug(cookies)

    this.cookies = cookies
    this.subdomains = subdomains
    this.domain = 'dmm.com'
  },

  revokeRegionRestriction: function() {
    const targetCookie = {key: 'ckcy', value: 1}
    this.cookies = removeAndInjectCookie(this, targetCookie)
    return this.cookies
  },

  language: function(language) {
    language = language || languagePreset.language.japan
    const targetCookie = {key: 'cklg', value: language}
    this.cookies = removeAndInjectCookie(this, targetCookie)
    return this.cookies
  }
}

function removeAndInjectCookie(self, targetCookie) {
  let cookies
  appLog.verbose('remove cookies that has value ' + targetCookie.key)
  cookies = removeCookie(self.cookies, targetCookie)
  appLog.verbose('merge generated cookies')
  cookies = cookies.concat(generateCookies(targetCookie, [self.domain], self.subdomains))
  appLog.debug(self.cookies)
  return cookies
}

function removeCookie(cookies, targetCookie) {
  cookies = cookies.filter((cookie) => {
    return cookie.key != targetCookie.key
  })
  appLog.debug(cookies)
  return cookies
}

function generateCookies(keyVal, domains, paths) {
  appLog.verbose('create cookies')
  appLog.debug(keyVal)
  appLog.debug(domains)
  appLog.debug(paths)

  const cookies = []
  domains.forEach((domain) => {
    paths.forEach((path) => {
      const options = keyVal
      options.domain = domain
      options.path = path

      const cookie = new Cookie(options)
      cookies.push(cookie)
    })
  })

  appLog.debug(cookies)
  return cookies
}

module.exports = exports = inherit(Injector, languagePreset)
