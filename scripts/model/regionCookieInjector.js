'use strict';

const cookie = require('cookie');
const appLog = require('winston').loggers.get('app');

var injector = {
	inject: function(cookieArray) {
		cookieArray = cookieArray || [];

		appLog.verbose('create region cookie');
		var ckcy = cookie.serialize('ckcy', '1');
		var cklg = cookie.serialize('cklg', 'ja');
		appLog.debug('ckcy cookie: ' + ckcy);
		appLog.debug('cklg cookie: ' + cklg);

		appLog.verbose('inject cookie');
		[ckcy, cklg].forEach(function(regionCookie) {
			cookieArray.push(regionCookie);
		})

		appLog.verbose('serialize cookie into a string');
		var cookieString = serialize(cookieArray);
		appLog.debug('cookie string: ' + cookieString);
		return cookieString;
	}

}

function serialize(cookieArray) {
	cookieArray = cookieArray || [];
	return cookieArray.join('; ');
}

module.exports = exports = injector;
