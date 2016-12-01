'use strict'

const dmmAgent = require('./dmm/agent')

module.exports = {
  dmmAccount
}

function dmmAccount(username, password, done) {
  dmmAgent.login(username, password)
  .then(cookie => {
    return done(null, cookie)
  })
  .catch(done)
}
