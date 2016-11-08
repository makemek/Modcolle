'use strict'

const nockDmmAuth = require('../mock/dmm/auth')
const Cookie = require('tough-cookie').Cookie
const request = require('supertest-as-promised')
const app = require(global.SRC_ROOT)
require('should')

describe('/login', function() {

  var loginWithValidAccount, loginWithInvalidAccount

  beforeEach(function() {
    loginWithValidAccount = request(app)
    .post('/login')
    .send({username: 'someone', password: 'password'})
    .expect(302)
    .expect('location', '/')
    loginWithInvalidAccount = request(app)
    .post('/login')
    .send({
      username: nockDmmAuth.badAccount.email,
      password: nockDmmAuth.badAccount.password})
    .expect(302)
    .expect('location', '/')
  })

  it('if login success, return a session', done => {
    loginWithValidAccount
    .then(res => {
      var cookies = res.headers['set-cookie']
      cookies.should.be.ok('should have cookie header')
      cookies = cookies.map(Cookie.parse)
      cookies.filter(cookie => {
        return cookie.key === 'connect.sid'
      }).length.should.equal(1, 'should have 1 session')
      done()
    })
    .catch(done)
  })

  it('if login fail, DONT return a session', done => {
    loginWithInvalidAccount
    .then(res => {
      var cookies = res.headers['set-cookie']
      if(!cookies)
        return done()

      cookies = cookies.map(Cookie.parse)
      cookies.filter(cookie => {
        return cookie.key === 'connect.sid'
      }).length.should.equal(0, 'should have no session')
      done()
    })
    .catch(done)
  })
})
