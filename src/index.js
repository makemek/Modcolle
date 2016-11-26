'use strict'

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'DEFAULT'
process.env.LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info'
process.env.LOGGER_SILENT = (process.env.LOGGER_SILENT || 'true').toLowerCase().trim()

module.exports = require('./modcolle')
