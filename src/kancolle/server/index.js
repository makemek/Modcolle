'use strict'

const KcServer = require('./server')
const urlparse = require('url-parse')
const ACCESS_KEY = 'KANCOLLE_SERVER_'
const servers = {}

for(let worldId = 1; process.env.hasOwnProperty(ACCESS_KEY + worldId); ++worldId) {
  const url = urlparse(process.env[ACCESS_KEY + worldId])
  const kancolleServer = new KcServer(worldId, url.href)
  servers[worldId] = kancolleServer
  servers[url.hostname] = kancolleServer
}

module.exports = servers
