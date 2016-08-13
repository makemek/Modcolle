'use strict';

const inherit = require('inherit');
const express = require('express');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const nconf = require('nconf');
const winston = require('winston');
const expressLog = winston.loggers.get('express');
const router = require('./routing/');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const dmmAuthenticator = require('./middleware/dmm-passport');
const morgan = require('morgan');

var Application = {

	__constructor: function() {
		this.app = express();
		
		setupMiddleware(this.app);
		setupTemplateEngine(this.app);
		setupDefaultLocalResponseHeader(this.app);
		setupRouting(this.app);
	},

	start: function(port, afterStart) {
		this.app.listen(port, afterStart);
	}
}

function setupDefaultLocalResponseHeader(app) {
	app.use(function(req, res, next) {
	   res.set('X-Powered-By', 'ModColle');
	   next();
	});
}

function setupRouting(app) {
	app.use('/', router);
}

function setupMiddleware(app) {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(session({
		secret: 'shhhh',
		resave: true,
		saveUninitialized: false
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	passport.use(new LocalStrategy(dmmAuthenticator.authenticate));
	passport.serializeUser(dmmAuthenticator.serialize);
	passport.deserializeUser(dmmAuthenticator.deserialize);

	expressLog.stream = {
	    write: function(message, encoding){
	        expressLog.info(message);
	    }
	};
	app.use(morgan('combined', {stream: expressLog.stream}))
}

function setupTemplateEngine(app) {
	var engineName = 'hbs';
	var templateExtension = 'hbs';
	var baseDirView = 'src/views';

	var options = {
		defaultLayout: 'defaultLayout', 
		extname: templateExtension,

		layoutsDir: baseDirView + '/layouts',
		partialsDir: baseDirView + '/partials'
	}
	var hbs = expressHandlebars.create(options);

	app.engine(engineName, hbs.engine);
	app.set('views', baseDirView);
	app.set('view engine', engineName);
}



module.exports = exports = inherit(Application);