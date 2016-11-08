'use strict'

const Agent = require(global.SRC_ROOT + '/kancolle/server/server')
const sinon = require('sinon')
const rp = require('request-promise')
const osapi = require(global.SRC_ROOT + '/dmm/osapi')
const playerProfile = require('../mock/kancolle/api-terminal')
const urljoin = require('url-join')
const stream = new require('stream').Readable()
const nock = require('nock')
const URL = require('url-parse')
const should = require('should')

describe('kancolle server', () => {

  var agent
  const KANCOLLE_CONFIG = {
    baseDir: 'base',
    serv: 'http://0.0.0.0'
  }

  beforeEach(() => {
    agent = new Agent(1, KANCOLLE_CONFIG.serv)
  })

  it('download from the internet', (done) => {
    var sensitiveParams = '?api_token=abc&api_starttime=1234'
    var url = 'http://www.example.com/'

    nock(url)
    .get('/')
    .reply(200)

    stream.end = done
    var req = agent.download(urljoin(url, sensitiveParams))
    req.pipe(stream)

    req.uri.href.should.equal(url, 'should not contain api token query parameter')
    req.headers['x-requested-with'].should.startWith('ShockwaveFlash/', 'should set header x-requested-with ShockwaveFlash')
  })

  it('call API', sinon.test(function() {
    var apiUrl = '/kcsapi/some/api'
    var payload = {}
    var headers = {headers: {someHeader: 'header'}}
    var httpPost = this.stub(rp, 'post')
    var agentUrl = new URL(agent.host)

    agent.apiRequest(apiUrl, payload, headers)

    sinon.assert.calledOnce(httpPost)
    var postArgs = httpPost.firstCall.args[0]
    postArgs.url.should.equal(urljoin(agent.host, apiUrl), 'should make correct post url')
    postArgs.headers.host.should.equal(agentUrl.host)
    postArgs.headers.origin.should.equal(agentUrl.origin)
    postArgs.headers.should.not.ownProperty('connection')
    postArgs.headers.should.not.ownProperty('content-length')
    postArgs.headers.should.not.ownProperty('content-type')
    postArgs.headers.should.containEql(headers)
  }))

  it('generate api token for non-banned player', (done) => {
    agent.generateApiToken({VIEWER_ID: playerProfile.oldPlayer.dmmId, ST: 'xxxxxxxxx'})
    .then(player => {
      should(player.isBan).be.false('should not get banned')
      done()
    })
    .catch(done)
  })

  it('NOT generate api token for banned player', sinon.test(function(done) {
    var body = 'svdata=' + JSON.stringify({api_result: 301})
    this.stub(osapi, 'proxyRequest').returns(Promise.resolve({body: body}))
    agent.generateApiToken({})
    .then(player => {
      should(player.isBan).be.true('this player should be banned')
      should.not.exist(player.api_token, 'no api token should be given')
      should.not.exist(player.api_start_time, 'no api start time should be given')
      done()
    })
    .catch(done)
  }))

})
