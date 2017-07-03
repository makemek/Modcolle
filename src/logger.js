'use strict'

const LOGGER_LEVEL = process.env.LOGGER_LEVEL
const LOGGER_PRETTY = process.env.LOGGER_PRETTY

const pino = require('pino')({
  level: LOGGER_LEVEL,
  prettyPrint: LOGGER_PRETTY === 'true'
})
const labels = ['app:middleware', 'app:router', 'service:dmm', 'service:kancolle']

const loggers = {}
labels.forEach(label => {
  loggers[label] = pino.child({label})
})

module.exports = function(label) {
  if(!loggers[label])
    return pino
  return loggers[label]
}
