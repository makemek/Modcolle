'use strict'

const Kancolle = require(global.SRC_ROOT + '/kancolle/game')
const rp = require('request-promise')
const sinon = require('sinon')
const async = require('async')
const sprintf = require('sprintf-js').sprintf
const apiTerminal = require('../mock/kancolle/api-terminal')
const KancolleChildServers = require(global.SRC_ROOT + '/kancolle/server')
const should = require('should')

const sandbox = sinon.sandbox.create()

describe('Kancolle game', () => {

  describe('Maintenance test', () => {

    let code
    beforeEach(() => {
      code =
      `
      var ConstServerInfo = {servFoo:"servBar"}, ConstURLInfo = {urlFoo:"urlBar"}
      var MaintenanceInfo = {}
      MaintenanceInfo.IsDoing       = %d
      MaintenanceInfo.IsEmergency   = %d
      MaintenanceInfo.StartDateTime = Date.parse("2016/07/15 11:00:00")
      MaintenanceInfo.EndDateTime   = Date.parse("2016/07/15 17:50:00")
      `
    })

    it('is NOT on maintenance', done => {
      const sourceText = sprintf(code, 0, 0)
      const httpRequest = sinon.stub(rp, 'get')
      .returns(Promise.resolve(sourceText))

      Kancolle.getMaintenanceInfo()
      .then(maintenanceInfo => {
        should(maintenanceInfo.isMaintain).be.false()
        httpRequest.restore()
        done()
      })
      .catch(done)
    })

    async.forEach([
    {doing: 0, emergency: 1},
    {doing: 1, emergency: 0},
    {doing: 1, emergency: 1}], mode => {
      it(sprintf('is on maintenance (doing = %d, emergency = %d)', mode.doing, mode.emergency), done => {
        const sourceText = sprintf(code, mode.doing, mode.emergency)
        const httpRequest = sinon.stub(rp, 'get')
        .returns(Promise.resolve(sourceText))

        Kancolle.getMaintenanceInfo()
        .then(maintenanceInfo => {
          should(maintenanceInfo.isMaintain).be.true()
          httpRequest.restore()
          done()
        })
        .catch(done)
      })
    })
  })

  describe('world server', () => {

    const kancolleServerIpArray = []

    before(() => {
      Object.keys(KancolleChildServers).map(key => {
        kancolleServerIpArray.push(KancolleChildServers[key].host)
      })
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('return world id 0 if player is new', done => {
      const gadgetInfo = {VIEWER_ID: apiTerminal.newPlayer.dmmId}
      Kancolle.getWorldServerId(gadgetInfo)
      .then(worldId => {
        worldId.should.equal(0, 'world id should be 0')
        done()
      })
      .catch(done)
    })

    it('return world id greater than 0 if player is old', done => {
      const gadgetInfo = {VIEWER_ID: apiTerminal.oldPlayer.dmmId}
      Kancolle.getWorldServerId(gadgetInfo)
      .then(worldId => {
        worldId.should.above(0, 'world id should be greater than 0')
        done()
      })
      .catch(done)
    })

    it('should return error when internal error occurred in the target server', done => {
      const error = {api_data: 0}
      const errorResponse = 'svdata=' + JSON.stringify(error)
      sandbox.stub(rp, 'get')
      .returns(Promise.resolve(errorResponse))

      Kancolle.getWorldServerId({})
      .catch(error => {
        should(error).be.ok()
        done()
      })
    })
  })
})
