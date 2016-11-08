'use strict'

const dmmPassport = require(global.SRC_ROOT + '/middleware/dmm-passport')
const tough = require('tough-cookie')
const Cookie = tough.Cookie
const nockDmmAuth = require('../mock/dmm/auth')
const async = require('async')
const sinon = require('sinon')
const should = require('should')

describe('DMM passport middleware', () => {

  it('grant access', (done) => {
    dmmPassport.authenticate('someone@example.com', 'password', (error, cookies) => {
      if(error)
        return done(error)

      cookies = cookies.map(Cookie.parse)
      cookies.filter((cookie) => {
        return cookie.key === 'INT_SESID'
      })
      cookies.length.should.equal(1, 'should have 1 session cookie (INT_SESID)')
      done()
    })
  })

  it('deny access', (done) => {
    dmmPassport.authenticate(nockDmmAuth.badAccount.email, nockDmmAuth.badAccount.password, (error, cookies) => {
      if(error)
        return done(error)
      cookies.should.be.false()
      done()
    })
  })

  async.forEach([
  {case: 'no cookies', input: []},
  {case: 'no session', input: ['others=doe', 'foo=bar']},
  {case: 'more than 1 sessions', input: [nockDmmAuth.session, nockDmmAuth.session, nockDmmAuth.session]}
  ], (testcase) => {
    it('serialize ' + testcase.case + ' should return an error', (done) => {
      dmmPassport.serialize(testcase.input, (error, session) => {
        error.should.be.an.instanceof(Error)
        should.not.exist(session, 'no session should be given')
        done()
      })
    })
  })

  it('serialize 1 session', (done) => {
    const others = 'others=doe', foo = 'foo=bar'
    const cookies = [nockDmmAuth.session, others, foo]
    dmmPassport.serialize(cookies, (error, injectedCookies) => {
      if(error)
        return done(error)

      should(injectedCookies).be.String('session should be a string')
      injectedCookies.should.containEql(nockDmmAuth.session)
      injectedCookies.should.not.containEql(others)
      injectedCookies.should.not.containEql(foo)
      injectedCookies.should.containEql('ckcy')
      done()
    })
  })

  it('deserialize session', (done) => {
    const expectedCookies = [nockDmmAuth.session, 'others=doe']
    dmmPassport.deserialize(expectedCookies, (error, cookies) => {
      if(error)
        return done(error)

      cookies.should.equal(expectedCookies, 'no cookie should be altered')
      done()
    })
  })

  it('if authenticated, callback next middleware', sinon.test(function() {
    const req = {isAuthenticated: function() {return true}}
    const res = {redirect: function() {}}
    const spyRes = this.spy(res, 'redirect'), spyNext = this.spy()
    dmmPassport.isAuthenticated(req, res, spyNext)
    should(spyNext.calledOnce).be.true('callback should be called once')
    should(spyRes.called).be.false('response should never be called')
  }))

  it('if not authenticate, redirect to home page', sinon.test(function() {
    const req = {isAuthenticated: function() {return false}}
    const res = {redirect: function() {}}
    const spyRes = this.spy(res, 'redirect'), spyNext = this.spy()
    dmmPassport.isAuthenticated(req, res, spyNext)
    should(spyNext.called).be.false('callback should never be called')
    should(spyRes.calledOnce).be.true('response should be called once')
    spyRes.firstCall.args[0].should.equal('/', 'should redirect to home page')
  }))
})
