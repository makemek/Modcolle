'use strict'

const agent = require(global.SRC_ROOT + '/dmm/agent')
const dmmAuth = require('../mock/dmm/auth')
require('should')

describe('DMM agent', () => {

  it('scrape login token from DMM login page', (done) => {
    agent.scrapeToken()
    .then((TOKEN) => {
      TOKEN.DMM_TOKEN.should.equal(dmmAuth.token.dmm, 'DMM token should be equal')
      TOKEN.DATA_TOKEN.should.equal(dmmAuth.token.data, 'data token should be equal')
      done()
    })
    .catch(done)
  })

  it('authroize token', (done) => {
    agent.authorizeToken({DMM_TOKEN: dmmAuth.token.dmm, DATA_TOKEN: dmmAuth.token.data})
    .then((authToken) => {
      authToken.token.should.equal(dmmAuth.token.auth.token)
      authToken.login_id.should.equal(dmmAuth.token.auth.login_id)
      authToken.password.should.equal(dmmAuth.token.auth.password)
      done()
    })
    .catch(done)
  })

  it('authentication using token success', (done) => {
    agent.authenticate('some@one.com', 'password', dmmAuth.token.auth)
    .then((cookie) => {
      cookie.should.containEql(dmmAuth.session)
      done()
    })
    .catch(done)
  })

  it('authentication using token fail due to incorrect email or password', (done) => {
    agent.authenticate(dmmAuth.badAccount.email, dmmAuth.badAccount.password, dmmAuth.token.auth)
    .then((cookie) => {
      cookie.should.be.false('login should fail')
      done()
    })
    .catch(done)
  })

  it('login success', (done) => {
    agent.login('some@one.com', 'password')
    .then((cookie) => {
      cookie.should.containEql(dmmAuth.session)
      done()
    })
    .catch(done)
  })

  it('login fail', (done) => {
    agent.login(dmmAuth.badAccount.email, dmmAuth.badAccount.password)
    .then((cookie) => {
      cookie.should.be.Boolean()
      cookie.should.be.false('login should fail')
      done()
    })
    .catch(done)
  })
})
