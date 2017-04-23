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

const sandbox = sinon.sandbox.create()

describe('kancolle server', () => {

  let agent
  const KANCOLLE_CONFIG = {
    baseDir: 'base',
    serv: 'http://0.0.0.0'
  }

  beforeEach(() => {
    agent = new Agent(1, KANCOLLE_CONFIG.serv)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('download from the internet', done => {
    const sensitiveParams = '?api_token=abc&api_starttime=1234'
    const url = 'http://www.example.com/'

    nock(url)
    .get('/')
    .reply(200)

    stream.end = done
    const req = agent.download(urljoin(url, sensitiveParams))
    req.pipe(stream)

    req.uri.href.should.equal(url, 'should not contain api token query parameter')
    req.headers['x-requested-with'].should.startWith('ShockwaveFlash/', 'should set header x-requested-with ShockwaveFlash')
  })

  it('call API', () => {
    const apiUrl = '/kcsapi/some/api'
    const payload = {}
    const headers = {headers: {someHeader: 'header'}}
    const httpPost = sandbox.stub(rp, 'post')
    const agentUrl = new URL(agent.host)

    agent.apiRequest(apiUrl, payload, headers)

    sinon.assert.calledOnce(httpPost)
    const postArgs = httpPost.firstCall.args[0]
    postArgs.url.should.equal(urljoin(agent.host, apiUrl), 'should make correct post url')
    postArgs.headers.host.should.equal(agentUrl.host)
    postArgs.headers.origin.should.equal(agentUrl.origin)
    postArgs.headers.should.not.ownProperty('connection')
    postArgs.headers.should.not.ownProperty('content-length')
    postArgs.headers.should.not.ownProperty('content-type')
    postArgs.headers.should.containEql(headers)
  })

  it('generate api token for non-banned player', done => {
    agent.generateApiToken({VIEWER_ID: playerProfile.oldPlayer.dmmId, ST: 'xxxxxxxxx'})
    .then(player => {
      should(player.isBan).be.false('should not get banned')
      done()
    })
    .catch(done)
  })

  it('NOT generate api token for banned player', done => {
    const body = 'svdata=' + JSON.stringify({api_result: 301})
    sandbox.stub(osapi, 'proxyRequest').returns(Promise.resolve({body: body}))
    agent.generateApiToken({})
    .then(player => {
      should(player.isBan).be.true('this player should be banned')
      should.not.exist(player.api_token, 'no api token should be given')
      should.not.exist(player.api_start_time, 'no api start time should be given')
      done()
    })
    .catch(done)
  })

})
