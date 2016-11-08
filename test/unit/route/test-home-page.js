'use strict'

const request = require('supertest-as-promised')
const app = require(global.SRC_ROOT)
const cheerio = require('cheerio')
const async = require('async')
const sinon = require('sinon')
const game = require(global.SRC_ROOT + '/kancolle/game')
const playerProfile = require('../mock/kancolle/api-terminal')
const osapi = require(global.SRC_ROOT + '/dmm/osapi')
const should = require('should')

describe('/index', () => {

  it('if not logged in, render a html page', done => {
    request(app)
    .get('/')
    .expect(200)
    .expect('content-type', /html/)
    .end(done)
  })

  async.forEach([
    {case: 'old player', targetUrl: '/kcs/mainD2.swf', account: {username: 'shimakaze', password: 'desu'}, playerProfile: playerProfile.oldPlayer},
    {case: 'new player', targetUrl: 'http://203.104.209.7/kcs/world.swf', account: {username: 'poi', password: 'poipoipoi'}, playerProfile: playerProfile.newPlayer},
    {case: 'banned player', targetUrl: 'http://203.104.209.7/kcs/ban.swf', account: {username: 'badTeitoku', password: 'T^T'}, playerProfile: playerProfile.bannedPlayer}],
  testcase => {
    it(`if ${testcase.case} logged in, launch ${testcase.targetUrl}`, sinon.test(function(done) {
      this.stub(game, 'getWorldServerId', () => {
        return Promise.resolve(testcase.playerProfile.world)
      })
      this.stub(osapi, 'getGameInfo', () => {
        return Promise.resolve({VIEWER_ID: testcase.playerProfile.dmmId, ST: 'abcd'})
      })

      request(app)
      .post('/login')
      .expect(302)
      .expect('location', '/')
      .send(testcase.account)
      .then(res => {
        return request(app)
        .get('/')
        .set('cookie', res.headers['set-cookie'])
        .expect(200)
      })
      .then(res => {
        const $ = cheerio.load(res.text)
        const url = $('#game').attr('data')

        should(url.startsWith(testcase.targetUrl)).ok('should start with ' + url)
        done()
      })
      .catch(done)
    }))
  })
})
