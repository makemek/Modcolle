'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const loginStrategy = require('./login-strategy')
const app = express()
const log = require('./logger')('app:router')
const router = require('./routing/')

log.info('=== Welcome to Modcolle ===')
setupMiddleware()
setupDefaultLocalResponseHeader()
setupRouting()
log.info('=== Finished App Configuration ===')

function setupDefaultLocalResponseHeader() {
  log.info('setup defult response header')
  app.use((req, res, next) => {
    res.set('X-Powered-By', 'ModColle')
    next()
  })
}

function setupRouting() {
  log.info('setup routing')
  app.use('/', router)
}

function setupMiddleware() {
  log.info('setup middlewares')
  log.debug('setup POST body parser')
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  log.debug('initialize passport')
  app.use(passport.initialize())
  passport.use('dmm-account', new LocalStrategy(loginStrategy.dmmAccount))
  passport.use('dmm-session', new LocalStrategy({
    usernameField: 'dmm_session', passwordField: 'dmm_session'},
  loginStrategy.dmmSession))
}

module.exports = app
