'use strict'

const LOGGER_SILENT = process.env.LOGGER_SILENT
const LOGGER_LEVEL = process.env.LOGGER_LEVEL
const LOGGER_TIMESTAMP = process.env.LOGGER_TIMESTAMP
const LOGGER_PRETTY_PRINT = process.env.LOGGER_PRETTY_PRINT

const winston = require('winston')
setupLogger()

const express = require('express')
const bodyParser = require('body-parser')
const expressHandlebars = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const dmmAuthenticator = require('./middleware/dmm-passport')
const morgan = require('morgan')
const app = express()
const routerLogger = winston.loggers.get('router')
const router = require('./routing/')

setupMiddleware()
setupTemplateEngine()
setupDefaultLocalResponseHeader()
setupRouting()

function setupLogger() {
  const loggers = ['app', 'router', 'agent']
  loggers.forEach(logger => {
    const loggerConfig = {
      console: {
        label: logger,
        level: LOGGER_LEVEL,
        colorize: 'all',
        silent: LOGGER_SILENT === 'true',
        timestamp: LOGGER_TIMESTAMP === 'true',
        prettyPrint: LOGGER_PRETTY_PRINT === 'true',
      }
    }
    winston.loggers.add(logger, loggerConfig)
  })
}

function setupDefaultLocalResponseHeader() {
  app.use((req, res, next) => {
    res.set('X-Powered-By', 'ModColle')
    next()
  })
}

function setupRouting() {
  app.use('/', router)
}

function setupMiddleware() {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(new LocalStrategy(dmmAuthenticator.authenticate))
  passport.serializeUser(dmmAuthenticator.serialize)
  passport.deserializeUser(dmmAuthenticator.deserialize)

  routerLogger.stream = {
    write: function(message){
      routerLogger.info(message)
    }
  }
  app.use(morgan('combined', {stream: routerLogger.stream}))
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
  const hbs = expressHandlebars.create(options)

  app.engine(engineName, hbs.engine)
  app.set('views', baseDirView)
  app.set('view engine', engineName)
}

module.exports = app
