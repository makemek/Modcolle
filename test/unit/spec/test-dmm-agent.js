'use strict'

const agent = require(SRC_ROOT + '/dmm/agent')
const async = require('async')
const dmmAuth = require('../mock/dmm/auth')

describe('DMM agent', function() {

  it('scrape login token from DMM login page', function(done) {
    agent.scrapeToken()
    .then(function(TOKEN) {
      assert.equal(TOKEN.DMM_TOKEN, dmmAuth.token.dmm, 'DMM token should be equal')
      assert.equal(TOKEN.DATA_TOKEN, dmmAuth.token.data, 'data token should be equal')
      done()
    })
    .catch(done)
  })

  it('authroize token', function(done) {
    agent.authorizeToken({DMM_TOKEN: dmmAuth.token.dmm, DATA_TOKEN: dmmAuth.token.data})
    .then(function(authToken) {
      assert.equal(authToken.token, dmmAuth.token.auth.token)
      assert.equal(authToken.login_id, dmmAuth.token.auth.login_id)
      assert.equal(authToken.password, dmmAuth.token.auth.password)
      done()
    })
    .catch(done)
  })

  it('authentication using token success', function(done) {
    agent.authenticate('some@one.com', 'password', dmmAuth.token.auth)
    .then(function(cookie) {
      assert.equal(cookie, dmmAuth.session)
      done()
    })
    .catch(done)
  })

  it('authentication using token fail due to incorrect email or password', function(done) {
    agent.authenticate(dmmAuth.badAccount.email, dmmAuth.badAccount.password, dmmAuth.token.auth)
    .then(function(cookie) {
      assert.isFalse(cookie, 'login should fail')
      done()
    })
    .catch(done)
  })

  it('login success', function(done) {
    agent.login('some@one.com', 'password')
    .then(function(cookie) {
      assert.equal(cookie, dmmAuth.session)
      done()
    })
    .catch(done)
  })

  it('login fail', function(done) {
    agent.login(dmmAuth.badAccount.email, dmmAuth.badAccount.password)
    .then(function(cookie) {
      assert.isBoolean(cookie, 'should be boolean')
      assert.isFalse(cookie, 'login should fail')
      done()
    })
    .catch(done)
  })
})
