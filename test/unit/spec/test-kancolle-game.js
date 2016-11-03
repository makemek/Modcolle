'use strcit'

const Kancolle = require(SRC_ROOT + '/kancolle/game')
const rp = require('request-promise')
const sinon = require('sinon')
const async = require('async')
const sprintf = require('sprintf-js').sprintf
const apiTerminal = require('../mock/kancolle/api-terminal')
const KancolleChildServers = require(SRC_ROOT + '/kancolle/server')

describe('Kancolle game', function() {

  describe('Maintenance test', function() {

    var code
    beforeEach(function() {
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

    it('is NOT on maintenance', function(done) {
      var sourceText = sprintf(code, 0, 0)
      var httpRequest = sinon.stub(rp, 'get')
      .returns(new Promise(function(resolve, reject) {
        return resolve(sourceText)
      }))

      Kancolle.getMaintenanceInfo()
      .then(function(maintenanceInfo) {
        assert.isFalse(maintenanceInfo.isMaintain)
        httpRequest.restore()
        done()
      })
      .catch(done)
    })

    async.forEach([
    {doing: 0, emergency: 1},
    {doing: 1, emergency: 0},
    {doing: 1, emergency: 1}], function(mode) {
      it(sprintf('is on maintenance (doing = %d, emergency = %d)', mode.doing, mode.emergency), function(done) {
        var sourceText = sprintf(code, mode.doing, mode.emergency)
        var httpRequest = sinon.stub(rp, 'get')
        .returns(new Promise(function(resolve, reject) {
          return resolve(sourceText)
        }))

        Kancolle.getMaintenanceInfo()
        .then(function(maintenanceInfo) {
          assert.isTrue(maintenanceInfo.isMaintain)
          httpRequest.restore()
          done()
        })
        .catch(done)
      })
    })
  })

  describe('world server', function(){

    var kancolleServerIpArray = []

    before(function() {
      Object.keys(KancolleChildServers).map(function(key) {kancolleServerIpArray.push(KancolleChildServers[key].host)})
    })

    it('return world id 0 if player is new', function(done) {
      var gadgetInfo = {VIEWER_ID: apiTerminal.newPlayer.dmmId}
      Kancolle.getWorldServerId(gadgetInfo)
      .then(worldId => {
        assert.equal(worldId, 0, 'world id should be 0')
        done()
      })
      .catch(done)
    })

    it('return world id greater than 0 if player is old', function(done) {
      var gadgetInfo = {VIEWER_ID: apiTerminal.oldPlayer.dmmId}
      Kancolle.getWorldServerId(gadgetInfo)
      .then(worldId => {
        assert.isAbove(worldId, 0, 'world id should be greater than 0')
        done()
      })
      .catch(done)
    })

    it('should return error when internal error occurred in the target server', sinon.test(function(done) {
      var error = {api_data: 0}
      var errorResponse = 'svdata=' + JSON.stringify(error)
      this.stub(rp, 'get')
      .returns(new Promise(function(resolve, reject) {
        return resolve(errorResponse)
      }))
      
      Kancolle.getWorldServerId({})
      .catch(error => {
        assert.isDefined(error)
        done()
      })
    }))
  })
})

