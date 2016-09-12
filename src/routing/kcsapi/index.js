'use strict';

const express = require('express');
const router = express.Router();
const appLog = require('winston').loggers.get('app');
const kancolle = require('../../kancolle/');

router.post('/*', function(req, res, next) {
	extractWorldIdFromApiToken(req, res, next);
	var server = kancolle.getServer(req.body.worldId);
	if(!server)
		return res.sendStatus(400);

	appLog.verbose('remove worldId from payload');
	delete req.body.worldId;

	server
	.apiRequest(req.originalUrl, req.body, req.headers)
	.then(apiResponse => {
		apiResponse = apiResponse.replace('svdata=', '');
		apiResponse = JSON.parse(apiResponse);
		appLog.verbose('==== BEGIN OF API RESPONSE ===');
		appLog.verbose(apiResponse);
		appLog.verbose('==== END OF API RESPONSE ===');
		res.json(apiResponse);
	})
	.catch(next);
})

function extractWorldIdFromApiToken(req, res, next) {
	var api_token = req.body.api_token;
	if(!api_token) {
		appLog.info('API token not found');
		return res.sendStatus(400);
	}
	var extraInfos = api_token.split('_');
	if(extraInfos.length == 1) {
		appLog.info('there is no embeded information');
		return res.sendStatus(400);
	}

	req.body.worldId = extraInfos[0];
	req.body.api_token = extraInfos[1];
}

module.exports = exports = router;
