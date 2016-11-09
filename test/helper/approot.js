'use strict'

const path = require('path')
const appRoot = require('app-root-path')
const slash = require('slash')

const src = path.join(appRoot.path, 'src')

global.SRC_ROOT = slash(src)
