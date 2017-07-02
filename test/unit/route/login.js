'use strict'

const request = require('supertest-as-promised')
const app = require(global.SRC_ROOT)
const sinon = require('sinon')
const game = require(global.SRC_ROOT + '/kancolle/game')
const playerProfile = require('../mock/kancolle/api-terminal')
const osapi = require(global.SRC_ROOT + '/dmm/osapi')
const should = require('should')
const errors = require(global.SRC_ROOT + '/errors')
const nockAuth = require('../mock/dmm/auth')

const sandbox = sinon.sandbox.create()
const accountTestcases = [
  {case: 'old player', targetUrl: '/kcs/mainD2.swf', account: {username: 'shimakaze', password: 'desu'}, playerProfile: playerProfile.oldPlayer},
  {case: 'new player', targetUrl: 'http://203.104.209.7/kcs/world.swf', account: {username: 'poi', password: 'poipoipoi'}, playerProfile: playerProfile.newPlayer},
  {case: 'banned player', targetUrl: 'http://203.104.209.7/kcs/ban.swf', account: {username: 'badTeitoku', password: 'T^T'}, playerProfile: playerProfile.bannedPlayer}
]

describe('/dmm-account', () => {

  afterEach(() => {
    sandbox.restore()
  })

  accountTestcases.forEach(testcase => {
    it(`if ${testcase.case} logged in, launch ${testcase.targetUrl}`, () => {
      stubNetworkRelatedMethods(testcase.playerProfile.world, testcase.playerProfile.dmmId)
      return assertGameLink('/dmm-account', testcase.account, testcase.targetUrl)
    })
  })

  it('should response http 401 if username and password is incorrect', () => {
    return request(app)
    .post('/dmm-account')
    .send({username: nockAuth.badAccount.email, password: nockAuth.badAccount.password})
    .expect(401)
    .expect(res => {
      res.body.success.should.be.False()
      res.body.error.status.should.equal(401)
    })
  })
})

describe('/dmm-session', () => {

  afterEach(() => {
    sandbox.restore()
  })

  accountTestcases.forEach(testcase => {
    it(`if ${testcase.case} logged in, launch ${testcase.targetUrl}`, () => {
      stubNetworkRelatedMethods(testcase.playerProfile.world, testcase.playerProfile.dmmId)
      return assertGameLink('/dmm-session', {dmm_session: 'session'}, testcase.targetUrl)
    })
  })

  it('fail to get gadgetInfo should fail response http 401', () => {
    sandbox.stub(osapi, 'getGameInfo').callsFake(() => {
      return Promise.reject(new errors.DmmError())
    })

    return request(app)
    .post('/dmm-session')
    .send({dmm_session: 'session'})
    .expect(401)
    .expect(res => {
      res.body.success.should.be.False()
      res.body.error.status.should.equal(401)
    })
  })

  it('other errors occured should be handled by done() callback', () => {
    sandbox.stub(osapi, 'getGameInfo').callsFake(() => {
      return Promise.reject('an error occured')
    })

    return request(app)
    .post('/dmm-session')
    .send({dmm_session: 'session'})
    .expect(500)
  })
})

function assertGameLink(appLink, payload, expectedLink) {
  return request(app)
  .post(appLink)
  .expect(200)
  .expect('Content-Type', /json/)
  .send(payload)
  .then(res => {
    const {flashUrl} = res.body
    flashUrl.should.be.String()
    should(flashUrl.startsWith(expectedLink))
  })
}

function stubNetworkRelatedMethods(fakeWorldId, fakeDmmId) {
  sandbox.stub(game, 'getWorldServerId').callsFake(() => {
    return Promise.resolve(fakeWorldId)
  })
  sandbox.stub(osapi, 'getGameInfo').callsFake(() => {
    return Promise.resolve({VIEWER_ID: fakeDmmId, ST: 'abcd'})
  })
}
