'use strict'

process.env.KANCOLLE_BASE_DIR = process.env.KANCOLLE_BASE_DIR || 'kancolle'
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'DEFAULT'
process.env.LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info'
process.env.LOGGER_SILENT = (process.env.LOGGER_SILENT || 'true').toLowerCase().trim()
process.env.LOGGER_TIMESTAMP = (process.env.LOGGER_TIMESTAMP || 'false').toLowerCase().trim()
process.env.LOGGER_PRETTY_PRINT = (process.env.LOGGER_PRETTY_PRINT || 'false').toLowerCase().trim()

module.exports = exports = require('./modcolle')