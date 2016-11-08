'use strict'

const KcServer = require('./server')
const urlparse = require('url-parse')
const ACCESS_KEY = 'KANCOLLE_SERVER_'
var servers = {}

for(let worldId = 1; process.env.hasOwnProperty(ACCESS_KEY + worldId); ++worldId) {
  let url = urlparse(process.env[ACCESS_KEY + worldId])
  let kancolleServer = new KcServer(worldId, url.href)
  servers[worldId] = kancolleServer
  servers[url.hostname] = kancolleServer
}

module.exports = exports = servers
