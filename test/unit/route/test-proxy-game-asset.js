'use strict'

const request = require('supertest-as-promised')
const app = require(global.SRC_ROOT)
const sinon = require('sinon')
const nock = require('nock')
const Server = require(global.SRC_ROOT + '/kancolle/server/server')
const kancolle = require(global.SRC_ROOT + '/kancolle/')
const URL = require('url-parse')
require('should')

describe('request kancolle world server image', () => {

  [
  {case: 'ip address', input: {host: 'http://1.0.1.0', worldImg: '001_000_001_000_t.png'}},
  {case: 'host name', input: {host: 'http://www.some.site.com', worldImg: 'www_some_site_com_t.png'}}
  ].forEach(testcase => {
    it('match with ' + testcase.case, sinon.test(function(done) {
      const host = testcase.input.host
      const worldImg = '/kcs/resources/image/world/' + testcase.input.worldImg
      const fakeImagePngContent = Buffer.from('1234abcdef')
      const fakeKancolleServer = new Server(1, host)

      nock(host)
      .get(worldImg)
        .reply(200, fakeImagePngContent, {
          server: 'nginx',
          'content-type': 'image/png',
          connection: 'close',
          pragma: 'public',
          'accept-ranges': 'bytes'
        })

      this.stub(kancolle, 'getServer', _host => {
        const resultHostname = new URL(_host).hostname
        const expectedHostname = new URL(host).hostname
        resultHostname.should.equal(expectedHostname, 'should have the same hostname')
        return fakeKancolleServer
      })

      request(app)
      .get(worldImg)
      .expect(200)
      .expect('content-type', 'image/png')
      .then(res => {
        res.body.toString().should.equal(fakeImagePngContent.toString(), 'should be the same image')
        done()
      })
      .catch(done)
    }))
  })

  it('NOT match with any Kancolle server host name', sinon.test(function(done) {
    this.stub(kancolle, 'getServer').returns(undefined)
    request(app)
    .get('/kcs/resources/image/world/xxxxxxxxxxxx.png')
    .expect(400)
    .end(done)
  }))
})

describe('request assets from Kancolle server', () => {

  let kancolleGetServer
  let nockRequest
  const HOST = 'http://1.2.3.4'

  before(() => {
    nockRequest = nock(HOST)
  })

  beforeEach(() => {
    kancolleGetServer = sinon.stub(kancolle, 'getServer', () => {
      const server = new Server(1, HOST)
      return server
    })
  })

  afterEach(() => {
    sinon.restore(kancolleGetServer)
  })

  const fileCategory = [
  {case: 'graphical image', input: '/kcs/resource/file.png'},
  {case: 'sound', input: '/kcs/sound/file.mp3'},
  {case: 'game component', input: '/kcs/file.swf'}]
  fileCategory.forEach(testcase => {
    describe(testcase.case, () => {

      it('file exists on the destinated server', done => {
        nockRequest
        .get(testcase.input)
        .reply(200)

        request(app)
        .get(testcase.input)
        .expect(200)
        .end(done)
      })

      it('file NOT exists on the destinated server', done => {
        nockRequest
        .get(testcase.input)
        .reply(404)

        request(app)
        .get(testcase.input)
        .expect(404)
        .end(done)
      })
    })
  })
})
