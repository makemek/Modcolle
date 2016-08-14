'use strict';

process.env.KANCOLLE_BASE_DIR = process.env.KANCOLLE_BASE_DIR || 'kancolle';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'DEFAULT';

module.exports = exports = require('./modcolle');