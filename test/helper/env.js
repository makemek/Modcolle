'use strict'

const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const configFile = path.join(path.resolve(), 'process.yml')
const config = yaml.safeLoad(fs.readFileSync(configFile))
const envs = config.apps[0].env

for(const key in envs)
  process.env[key] = envs[key]
