'use strict'

const DmmApi = require(global.SRC_ROOT + '/dmm/osapi')
const sinon = require('sinon')
const rp = require('request-promise')
require('../mock/dmm/net-game')
require('../mock/dmm/osapi')

const sandbox = sinon.sandbox.create()

describe('DMM API (OSAPI)', () => {

  let fakeGameId, fakeCookie

  beforeEach(() => {
    fakeGameId = 0
    fakeCookie = 'INT_SESID=abcd; ckcy=1; cklg=ja; a=1; b=2;'
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('get expected gadget information', done => {
    const httpRequest = sandbox.spy(rp, 'get')
    const expectedParsedGadget = {
      VIEWER_ID : 123,
      OWNER_ID  : 123,
      APP_ID    : 456,
      URL       : 'http://www.example.com',
      FRAME_ID  : 'game_frame',
      ST        : '0123456789abcdefghijklmnopqrstuvwxyz',
      TIME      : 1467570034,
      TYPE      : '',
      SV_CD     : 'xx_xxxxxx'
    }

    DmmApi.getGameInfo(fakeGameId, fakeCookie)
    .then(gadgetInfo => {
      const rpParam = httpRequest.firstCall.args[0]
      rpParam.uri.should.equal('http://www.dmm.com/netgame/social/-/gadgets/=/app_id=' + fakeGameId, 'http url should match')
      rpParam.headers.cookie.should.equal(fakeCookie, 'cookie should not be altered')
      gadgetInfo.should.deepEqual(expectedParsedGadget, 'gadgetInfo should have the same expected properties and values')
      done()
    })
    .catch(done)
  })

  it('should return error when there is no gadgetInfo variable', done => {
    sandbox.stub(rp, 'get').returns(Promise.resolve(''))
    DmmApi.getGameInfo(fakeGameId, fakeCookie)
    .then(done)
    .catch(error => {
      error.should.be.ok()
      done()
    })
  })

  describe('proxy request', () => {
    const securityToken = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/=+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/=+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/=+abcdefghijklmnopqrstuvwxy'
    it('should make proxy request to the target url', done => {
      DmmApi.proxyRequest('http://www.example.com', {ST: securityToken})
      .then(response => {
        response.should.be.Object()
        response.should.have.hasOwnProperty('body')
        response.should.have.hasOwnProperty('headers')
        response.should.have.hasOwnProperty('rc')
        response.rc.should.be.Number()
        done()
      })
      .catch(done)
    })

    it('invalid url ', done => {
      DmmApi.proxyRequest('http://invlidUrl', {ST: securityToken})
      .then(response => {
        response.body.should.equal('request error')
        done()
      })
      .catch(done)
    })

    it('invalid security token', done => {
      DmmApi.proxyRequest('', {ST: ''})
      .then(done)
      .catch(error => {
        error.statusCode.should.equal(500, 'http status code should be internal server error (500)')
        done()
      })
    })
  })
})
