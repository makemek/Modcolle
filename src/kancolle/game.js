'use strict'

const KANCOLLE_MASTER_SERVER = process.env.KANCOLLE_SERVER_MASTER
const rp = require('request-promise')
const appLog = require('winston').loggers.get('app')
const sprintf = require('sprintf-js').sprintf

var Kancolle = {

  ENTRY_HOST: KANCOLLE_MASTER_SERVER,

  fetchConfig: function() {
    var options = {
      url: 'http://' + this.ENTRY_HOST + '/gadget/js/kcs_const.js'
    }

    appLog.info('load scripts from ' + options.url)
    return rp.get(options)
    .then(jsCode => {
      appLog.verbose('append js code to output variable value')
      var var2export = sprintf("JSON.stringify({%s, %s, %s})", 
        'ConstServerInfo', 'ConstURLInfo', 'MaintenanceInfo')
      jsCode += ';' + var2export

      appLog.info('emulate javascripts assuming that code from ' + options.url + ' is trusted')
      var json = JSON.parse(eval(jsCode))
      appLog.debug('parsed json result')
      appLog.debug(json)
      return Promise.resolve(json)
    })
  },

  getMaintenanceInfo: function() {
    return this.fetchConfig()
    .then(kcs_config => {
      var maintenanceInfo = kcs_config.MaintenanceInfo
      var isMaintain = Boolean(maintenanceInfo.IsDoing) || Boolean(maintenanceInfo.IsEmergency)
      maintenanceInfo.isMaintain = isMaintain
      delete maintenanceInfo.IsDoing
      delete maintenanceInfo.IsEmergency
      return Promise.resolve(maintenanceInfo)
    })
  },

  getWorldServerId: function(gadgetInfo) {
    var options = {
      uri: sprintf('%s/kcsapi/api_world/get_id/%s/1/%d', this.ENTRY_HOST, gadgetInfo.VIEWER_ID, Date.now()),
    }
    appLog.verbose('request to %s', options.uri)
    appLog.debug('options', options)
    return rp.get(options)
    .then(response => {
      appLog.verbose('response received from %s', options.uri)
      appLog.debug('response', response)

      appLog.verbose('remove "svndata=" and parse JSON')
      response = response.replace('svdata=', '')
      response = JSON.parse(response)
      appLog.debug('parsed result', response)

      if(response.api_result != 1) {
        var error = new Error('Internal error at target server %s', this.ENTRY_HOST)
        appLog.error(error.message)
        return Promise.reject(error)
      }

      var worldId = response.api_data.api_world_id
      appLog.verbose('player id %d resides in world id %d', gadgetInfo.VIEWER_ID, worldId)
      return Promise.resolve(worldId)
    })    
  }
}

module.exports = exports = Kancolle
