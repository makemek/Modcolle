'use strict';

const express = require('express');
const router = express.Router();
const zlib = require('zlib');

const kancolleExternal = require('../../model/kancolleExternal');
const agent = require('../../model/agent');
const appLog = require('winston').loggers.get('app');
const expressLog = require('winston').loggers.get('express');

router.post('/*', function(req, res, next) {
	expressLog.info('POST: ' + req.url);
	var apiUrl = kancolleExternal.api(req.url);
	appLog.info('----API REQUEST----');
	appLog.info('POST API: ' + apiUrl);
	appLog.info('Parameters: ', req.body);

	agent.apiRequest(apiUrl, req, function(error, httpResponse, body) {
		if(error) {
			appLog.error(error);
			return next(error);
		}

		decodeResponse(httpResponse, body, function(response) {
			var jsonResponse = JSON.parse(response.replace('svdata=', ''));
			appLog.info('----API RESPONSE----');
			appLog.info(jsonResponse); 
			appLog.info('----END RESPONSE----');
			res.send(response);
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
