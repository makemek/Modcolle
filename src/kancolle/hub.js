'use strict'

const servers = require('./server/')
const Kancolle = require('./game')
const urljoin = require('url-join')
const log = require('../logger')('service:kancolle')

module.exports = {
  /**
   * Application id
   * @type {Number}
   */
  appId: 854854,

  /**
   * Request Kancolle server object
   * @param  {string} key - can be either the world id starting at 1 or server's host name. Checkout @link{http://kancolle.wikia.com/wiki/Servers|Server List} for more detail.
   * @return {object} server - a Kancolle server object
   */
  getServer,

  /**
   * Start Kancolle
   * @param  {object}   gadgetInfo - gadget information containing player's id and security token issued by DMM
   * @return {Promise<Url>} fileUrl - URL to swf file to launch the game
   */
  launch
}

function getServer(key) {
  log.info(`get server from key ${key}`)
  return servers[key]
}

function launch(gadgetInfo) {
  log.info(`DMM ID ${gadgetInfo.VIEWER_ID} launch Kancolle`)
  return Kancolle.getWorldServerId(gadgetInfo)
  .then(worldId => {
    if(worldId == 0)
      return newPlayer(gadgetInfo)
    else
      return oldPlayer(gadgetInfo, worldId)
  })
}

function newPlayer(gadgetInfo) {
  const worldSelection = urljoin(Kancolle.ENTRY_HOST, 'kcs', 'world.swf')
  log.info(`DMM ID ${gadgetInfo.VIEWER_ID} is a new player. Display world selection ${worldSelection}`)
  return Promise.resolve(worldSelection)
}

function oldPlayer(gadgetInfo, worldId) {
  log.info(`DMM ID ${gadgetInfo.VIEWER_ID} is an old player (has already select a world)`)
  const server = getServer(worldId)
  return server.generateApiToken(gadgetInfo).then(player => {
    if(player.isBan) {
      const screenBan = urljoin(Kancolle.ENTRY_HOST, 'kcs', 'ban.swf')
      log.info(`${gadgetInfo.VIEWER_ID} is banned by the game. Display a ban screen ${screenBan}`)
      return Promise.resolve(screenBan)
    } else {
      const gameMain = urljoin(server.host, 'kcs', 'mainD2.swf')
      log.info(`DMM ID ${gadgetInfo.VIEWER_ID} is not banned. Launch Kancolle (API token not shown due to privacy)`, gameMain)
      return Promise.resolve(urljoin(gameMain, `?api_token=${player.api_token}`, `?api_starttime=${player.api_start_time}`))
    }
  })
}
