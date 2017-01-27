'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const expressHandlebars = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const loginStrategy = require('./login-strategy')
const morgan = require('morgan')
const app = express()
const log = require('./logger')('app:router')
const router = require('./routing/')
const path = require('path')

const SESSION_SECRET = process.env.SESSION_SECRET

log.info('=== Welcome to Modcolle ===')
setupMiddleware()
setupTemplateEngine()
setupDefaultLocalResponseHeader()
setupRouting()
setupStaticResourceDirectory()
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
  log.verbose('setup POST body parser')
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  log.verbose(`setup session using session secret ${SESSION_SECRET}`)
  app.use(session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: false
  }))
  log.verbose('initialize passport')
  app.use(passport.initialize())
  passport.use('dmm-account', new LocalStrategy(loginStrategy.dmmAccount))
  passport.use('dmm-session', new LocalStrategy({
    usernameField: 'dmm_session', passwordField: 'dmm_session'},
  loginStrategy.dmmSession))

  log.verbose('configure stream log messages from morgan')
  log.stream = {
    write: function(message){
      log.info(message)
    }
  }
  app.use(morgan('combined', {stream: log.stream}))
}

function setupTemplateEngine() {
  const engineName = 'hbs'
  const templateExtension = 'hbs'
  const baseDirView = 'src/views'

  const options = {
    defaultLayout: 'defaultLayout',
    extname: templateExtension,

    layoutsDir: baseDirView + '/layouts',
    partialsDir: baseDirView + '/partials'
  }
  log.info(`setup template engine ${engineName}`, options)
  const hbs = expressHandlebars.create(options)

  app.engine(engineName, hbs.engine)
  app.set('views', baseDirView)
  app.set('view engine', engineName)
}

function setupStaticResourceDirectory() {
  const staticDir = path.join(__dirname, 'views/public')
  log.info('setup static directory', staticDir)
  app.use('/', express.static(staticDir));
}

module.exports = app
