'use strict'

const LOGGER_SILENT = process.env.LOGGER_SILENT
const LOGGER_LEVEL = process.env.LOGGER_LEVEL

const winston = require('winston')
const labels = ['app:middleware', 'app:router', 'service:dmm', 'service:kancolle']

const loggers = {}
labels.forEach(label => {
  createCustomWinstonLogger(label)
  loggers[label] = winston.loggers.get(label)
})

module.exports = function(label) {
  if(!loggers[label])
    return winston
  return loggers[label]
}

function createCustomWinstonLogger(label) {
  const loggerConfig = {
    console: {
      label: label,
      level: LOGGER_LEVEL,
      colorize: 'all',
      silent: LOGGER_SILENT === 'true',
      timestamp: true,
      prettyPrint: false,
    }
  }
  winston.loggers.add(label, loggerConfig)
}
