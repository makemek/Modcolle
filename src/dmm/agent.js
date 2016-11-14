'use strict'

const rp = require('request-promise')
const appLog = require('../logger')('service:dmm')

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
    const options = {
      uri: 'https://www.dmm.com/my/-/login/=/path=Sg__/'
    }
    appLog.info('scrape login token from ' + options.uri)
    appLog.debug('options to module request')
    appLog.debug(options)

    return rp.get(options)
    .then(htmlBody => {
      const tokens = htmlBody.match(/[a-f0-9]{32}/g)
      const DMM_TOKEN = tokens[1]
      const DATA_TOKEN = tokens[2]

      appLog.debug('token from scraping')
      appLog.debug(tokens)
      appLog.debug('DMM_TOKEN: ' + DMM_TOKEN)
      appLog.debug('DATA_TOKEN: ' + DATA_TOKEN)
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
      }
    }
    appLog.debug('DMM_TOKEN: ' + TOKEN.DMM_TOKEN)
    appLog.debug('DATA_TOKEN: ' + TOKEN.DATA_TOKEN)
    appLog.info('authorize DMM Token and Data Token at ' + options.uri)
    appLog.debug('options to module request')
    appLog.debug(options)

    return rp.post(options)
    .then(tokens => {
      appLog.verbose('token received from ' + options.uri)
      appLog.debug(tokens)
      return Promise.resolve(JSON.parse(tokens))
    })
  },

  authenticate: function(email, password, dmmAjaxToken) {
    appLog.debug('JSON token')
    appLog.debug(dmmAjaxToken)
    appLog.debug('email: ' + email)
    appLog.debug('password: ' + password)

    appLog.verbose('prepare POST parameters')
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

    appLog.info('authenticate email and password to ' + options.uri)
    appLog.debug('options to module request')
    appLog.debug(options)

    return rp.post(options)
    .then(response => {
      // incorrect email or password will return statusCode 200 with empty body
      appLog.verbose('response retrieved from ' + options.uri)
      appLog.debug('status code: ' + response.statusCode)
      appLog.debug(response.headers)
      appLog.warn('login rejected')

      return Promise.resolve(false)
    })
    .catch(error => {
      const response = error.response
      const loginGranted = error.statusCode == 302 && response.headers.hasOwnProperty('set-cookie')

      appLog.debug('status code: ' + error.statusCode)
      appLog.debug(response.headers)
      appLog.debug('login granted: ' + loginGranted)

      if(loginGranted) {
        appLog.info('login success')
        return Promise.resolve(response.headers['set-cookie'])
      } else {
        appLog.error(error)
        return Promise.reject(error)
      }
    })
  }
}

module.exports = DmmAgent
