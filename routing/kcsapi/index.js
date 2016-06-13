'use strict';

const express = require('express');
const router = express.Router();

const kancolleExternal = require('../../model/kancolleExternal');
const agent = require('../../model/agent');

router.post('/*', function(req, res, next) {
	var apiUrl = kancolleExternal.api(req.url);
	console.log('----API REQUEST----');
	console.log('POST API: ' + apiUrl);
	console.log('Parameters: ' + req.body);

	agent.postRequest(apiUrl, req, function(error, httpResponse, body) {
		if(error)
			next(error);

		console.log('----API RESPONSE----');
		console.log(body);
		res.send(body);
	});
	// res.redirect(307, apiUrl);
})
module.exports = exports = router;
