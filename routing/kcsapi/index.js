'use strict';

const express = require('express');
const router = express.Router();
const zlib = require('zlib');

const kancolleExternal = require('../../model/kancolleExternal');
const agent = require('../../model/agent');

router.post('/*', function(req, res, next) {
	var apiUrl = kancolleExternal.api(req.url);
	console.log('----API REQUEST----');
	console.log('POST API: ' + apiUrl);
	console.log('Parameters: ' + JSON.stringify(req.body));

	agent.apiRequest(apiUrl, req, function(error, httpResponse, body) {
		if(error)
			return next(error);

		decodeResponse(httpResponse, body, function(response) {
			// uncomment this to view response from API
			console.log('----API RESPONSE----');
			console.log(response); 
			console.log('----END RESPONSE----');
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
