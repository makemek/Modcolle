'use strict'

const rp = require('request-promise')
const log = require('../logger')('service:dmm')

const DmmAgent = {

  login: function(email, password) {
    email = email.trim()
    password = password.trim()

    const authenticateUser = this.authenticate.bind(null, email, password)
    const promise = this.scrapeToken()
    .then(this.authorizeToken)
    .then(authenticateUser)

    return promise
  },

  scrapeToken: function() {
    const uri = 'https://www.dmm.com/my/-/login/=/path=Sg__/'
    log.info('scrape login token from %s', uri)
    return rp.get({uri})
    .then(htmlBody => {
      const tokenPattern = /[a-f0-9]{32}/g
      const tokens = htmlBody.match(tokenPattern)
      const DMM_TOKEN = tokens[1]
      const DATA_TOKEN = tokens[2]

      log.info('token matched with regex pattern %s', tokenPattern, tokens)
      return Promise.resolve({DMM_TOKEN, DATA_TOKEN})
    })
  },

  authorizeToken: function(TOKEN) {
    const options = {
      uri: 'https://www.dmm.com/my/-/login/ajax-get-token/',
      headers: {
        'DMM_TOKEN': TOKEN.DMM_TOKEN,
        'x-requested-with': 'XMLHttpRequest'
      },
      form: {
        token: TOKEN.DATA_TOKEN
      },
      transform: JSON.parse
    }
    log.info('%s authorize DMM Token "%s" and Data Token "%s"', options.uri, TOKEN.DMM_TOKEN, TOKEN.DATA_TOKEN)
    return rp.post(options)
  },

  authenticate: function(email, password, dmmAjaxToken) {
    const payload = {
      token: dmmAjaxToken.token,
      login_id: email,
      save_login_id: 0,
      password: password,
      save_password: 0,
      use_auto_login: 1,
      path: 'Sg__',
      prompt: '',
      client_id: '',
      display: ''
    }
    payload[dmmAjaxToken.login_id] = email
    payload[dmmAjaxToken.password] = password

    const options = {
      uri: 'https://www.dmm.com/my/-/login/auth/',
      headers: {'Upgrade-Insecure-Requests': 1},
      form: payload,
      resolveWithFullResponse: true
    }
    log.info('%s authenticate email "%s", password, and token "%s"', options.uri, email, dmmAjaxToken.token)
    return rp.post(options)
    .then( () => {
      // incorrect email or password will return statusCode 200 with empty body
      log.info('%s deny access due to incorrect email "%s", password, or token "%s"', options.uri, email, dmmAjaxToken.token)
      return Promise.resolve(false)
    })
    .catch(error => {
      const response = error.response
      const loginGranted = error.statusCode == 302 && response.headers.hasOwnProperty('set-cookie')

      if(loginGranted) {
        log.info('%s granted access to user %s', options.uri, email)
        log.verbose('get "%s"\'s cookies given by %s', email, options.uri)
        return Promise.resolve(response.headers['set-cookie'])
      } else {
        log.error(error)
        return Promise.reject(error)
      }
    })
  }
}

module.exports = DmmAgent
