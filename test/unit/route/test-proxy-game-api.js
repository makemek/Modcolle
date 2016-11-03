'use strict'

const request = require('supertest')
const app = require(SRC_ROOT)
const nock = require('nock')
const sinon = require('sinon')
const kancolle = require(SRC_ROOT + '/kancolle/')
const Server = require(SRC_ROOT + '/kancolle/server/server')

describe('proxy Kancolle API', function() {

  var payload
  const EMBEDED_SYMBOL = '_'

  beforeEach(function() {
    payload = {api_token: 'abcdef01234'}
  })
 
  it('have only API token should reject request', function(done) {
    request(app)
    .post('/kcsapi/some/api')
    .send(payload)
    .expect(400)
    .end(done)
  })

  it('have embeded symbol BUT no world id in API token should reject request', function(done) {
    payload.api_token = ['', payload.api_token].join(EMBEDED_SYMBOL)
    request(app)
    .post('/kcsapi/some/api')
    .send(payload)
    .expect(400)
    .end(done)
  })

  describe('world id embed in API token', function() {

    it('can be mapped to Kancolle server should accept request', sinon.test(function(done) {
      var host = 'http://0.0.0.0', world = '0'
      this.stub(kancolle, 'getServer', _ => {
        return new Server(world, host)
      })
      var embededPayload = {api_token: [world, payload.api_token].join(EMBEDED_SYMBOL)}

      nock(host)
      .post('/kcsapi/some/api', payload)
      .reply(200, 'svdata={"response": "OK"}')
      
      request(app)
      .post('/kcsapi/some/api')
      .send(embededPayload)
      .expect(200)
      .end(done)
    }))

    it('can NOT be mapped to Kancolle server should reject request', function(done) {
      payload.api_token = ['!@#$%^&*()+<>?', payload.api_token].join(EMBEDED_SYMBOL)
      request(app)
      .post('/kcsapi/some/api')
      .send(payload)
      .expect(400)
      .end(done)
    })

  })
})