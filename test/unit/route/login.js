'use strict'

const request = require('supertest-as-promised')
const app = require(global.SRC_ROOT)
const cheerio = require('cheerio')
const sinon = require('sinon')
const game = require(global.SRC_ROOT + '/kancolle/game')
const playerProfile = require('../mock/kancolle/api-terminal')
const osapi = require(global.SRC_ROOT + '/dmm/osapi')
const should = require('should')
const errors = require(global.SRC_ROOT + '/errors')
const nockAuth = require('../mock/dmm/auth')

const sandbox = sinon.sandbox.create()

const testcases = [
  {case: 'old player', targetUrl: '/kcs/mainD2.swf', account: {username: 'shimakaze', password: 'desu'}, playerProfile: playerProfile.oldPlayer},
  {case: 'new player', targetUrl: 'http://203.104.209.7/kcs/world.swf', account: {username: 'poi', password: 'poipoipoi'}, playerProfile: playerProfile.newPlayer},
  {case: 'banned player', targetUrl: 'http://203.104.209.7/kcs/ban.swf', account: {username: 'badTeitoku', password: 'T^T'}, playerProfile: playerProfile.bannedPlayer}
]

describe('/dmm-account', () => {

  afterEach(() => {
    sandbox.restore()
  })

  testcases.forEach(testcase => {
    it(`if ${testcase.case} logged in, launch ${testcase.targetUrl}`, () => {
      stubNetworkRelatedMethods(testcase.playerProfile.world, testcase.playerProfile.dmmId)
      return assertGameLink('/dmm-account', testcase.account, testcase.targetUrl)
    })
  })

  it('should redirect to / if username and password is incorrect', () => {
    return request(app)
    .post('/dmm-account')
    .send({username: nockAuth.badAccount.email, password: nockAuth.badAccount.password})
    .expect(302)
    .expect('location', '/')
  })
})

describe('/dmm-session', () => {

  afterEach(() => {
    sandbox.restore()
  })

  testcases.forEach(testcase => {
    it(`if ${testcase.case} logged in, launch ${testcase.targetUrl}`, () => {
      stubNetworkRelatedMethods(testcase.playerProfile.world, testcase.playerProfile.dmmId)
      return assertGameLink('/dmm-session', {dmm_session: 'session'}, testcase.targetUrl)
    })
  })

  it('fail to get gadgetInfo should fail authenthentication', () => {
    sandbox.stub(osapi, 'getGameInfo', () => {
      return Promise.reject(new errors.DmmError())
    })

    return request(app)
    .post('/dmm-session')
    .send({dmm_session: 'session'})
    .expect(302)
    .expect('location', '/')
  })

  it('other errors occured should be handled by done() callback', () => {
    sandbox.stub(osapi, 'getGameInfo', () => {
      return Promise.reject(new Error())
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
  .send(payload)
  .then(res => {
    const $ = cheerio.load(res.text)
    const url = $('#game').attr('data')

    url.should.be.String()
    should(url.startsWith(expectedLink))
  })
}

function stubNetworkRelatedMethods(fakeWorldId, fakeDmmId) {
  sandbox.stub(game, 'getWorldServerId', () => {
    return Promise.resolve(fakeWorldId)
  })
  sandbox.stub(osapi, 'getGameInfo', () => {
    return Promise.resolve({VIEWER_ID: fakeDmmId, ST: 'abcd'})
  })
}
