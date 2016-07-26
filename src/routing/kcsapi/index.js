'use strict';

const express = require('express');
const router = express.Router();
const zlib = require('zlib');
const kancolleExternal = require('../../kancolle/external');
const Agent = require('../../kancolle/server/server');
const appLog = require('winston').loggers.get('app');
const expressLog = require('winston').loggers.get('express');
const settings = require('nconf');

router.post('/*', function(req, res, next) {
	expressLog.info('POST: ' + req.originalUrl);
	expressLog.verbose('Parameters: ', req.body);

	var agent = new Agent(settings.get('MY_WORLD_SERVER'));
	var apiUrl = kancolleExternal.api(req.url);

	appLog.info('Call Kancolle API: ' + apiUrl);
	appLog.verbose('Parameters: ', req.body);
	agent.apiRequest(apiUrl, req, function(error, httpResponse, body) {
		if(error) {
			appLog.error(error);
			return next(error);
		}

		decodeResponse(httpResponse, body, function(response) {
			var jsonResponse = JSON.parse(response.replace('svdata=', ''));
			appLog.info('API response received from ' + apiUrl);
			appLog.verbose('Send response back to ' + req.headers['referer']);
			appLog.verbose('----API RESPONSE----');
			appLog.verbose(jsonResponse); 
			appLog.verbose('----END OF RESPONSE----');
			res.json(jsonResponse);
		});
	});
	// res.redirect(307, apiUrl);

})

function decodeResponse(httpResponse, buffer, onDone) {
	var stringEncodeMethod = 'utf-8';

	switch (httpResponse.headers['content-encoding']) {
		case 'gzip':
		case 'deflate':
			zlib.unzip(buffer, function(error, bufferDecompress) {
				onDone(bufferDecompress.toString(stringEncodeMethod));
			}); 
			break;

		default:
			onDone(buffer.toString(stringEncodeMethod));
	}
}

module.exports = exports = router;
