'use strict'

const LOGGER_ENABLE = process.env.LOGGER_ENABLE
const LOGGER_LEVEL = process.env.LOGGER_LEVEL
const LOGGER_PRETTY = process.env.LOGGER_PRETTY

const pino = require('pino')
const labels = ['app:middleware', 'app:router', 'service:dmm', 'service:kancolle']

const loggers = {}
labels.forEach(label => {
  loggers[label] = pino({
    name: label,
    enabled: LOGGER_ENABLE,
    level: LOGGER_LEVEL,
    prettyPrint: LOGGER_PRETTY
  })
})

module.exports = function(label) {
  if(!loggers[label])
    return winston
  return loggers[label]
}
