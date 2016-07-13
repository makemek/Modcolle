'use strict';

const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const appLog = require('winston').loggers.get('app');

var injector = {
	generate: function() {
		var cookieArray = [];

		appLog.verbose('generate cookie ckcy and cklg');
		var domain = 'dmm.com';
		var paths = ['/', '/netgame/', '/netgame_s/'];
		paths.forEach(function(path) {
			var ckcy = new Cookie({key: 'ckcy', value: '1', domain: domain, path: path});
			var cklg = new Cookie({key: 'cklg', value: 'welcome', domain: domain, path: path});

			cookieArray.push(ckcy.toString());
			cookieArray.push(cklg.toString());
		})

		appLog.debug(cookieArray);
		return cookieArray;
	}

}

module.exports = exports = injector;
