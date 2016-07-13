'use strict';

const settings = require('nconf');
const request = require('request');
const path = require('path');
const urljoin = require('url-join');
const urlparse = require('url-parse');
const agentLog = require('winston').loggers.get('agent');

const kancolleExternal = require('./external');

var agent = {

	load: function(res, path2file, onError) {
		var file = path.resolve(path.join(settings.get('KANCOLLE_BASE_DIR'), path2file));
		agentLog.info('Load file: ' + file);
		return res.sendFile(file, {}, onError);
	},

	download: function(res, url, onResponse) {
		var parsedUrl = removeUrlParameterSensitiveData(url);

		agentLog.info('Download: ' + parsedUrl);
		agentLog.verbose('Remove sensitive data in URL parameters');
		agentLog.verbose('Parsed URL: ' + parsedUrl);

		var forgeHeader = forgeKancolleHttpRequestHeader();
		delete forgeHeader['origin'];
		delete forgeHeader['referer'];
		forgeHeader['x-requested-with'] = 'ShockwaveFlash/22.0.0.192';
		agentLog.debug(forgeHeader);

		return request.get({
			url: parsedUrl,
			headers: forgeHeader
		}).on('response', onResponse).pipe(res);
	},

	apiRequest: function(_url, req, onResponse) {
		agentLog.info('POST URL: ' + _url);
		var returnResponseAsBuffer = null;
		request.post({
			url: _url, 
			form: req.body,
			headers: forgeKancolleHttpRequestHeader(req.headers),
			encoding: returnResponseAsBuffer
		}, onResponse);
	}
}

function forgeKancolleHttpRequestHeader(httpHeader) {
	agentLog.verbose('Forge HTTP header to match with HTTP request from browser');
	var headers = httpHeader || {};
	modifyHeader(settings.get('MY_WORLD_SERVER'), kancolleExternal.host());
	avoidSocketHangup();

	return headers;

	function avoidSocketHangup() {
		delete headers['connection'];
		delete headers['content-length'];
		delete headers['content-type'];
	}

	function cloneHeader(header) {
		return JSON.parse(JSON.stringify(header));
	}

	function modifyHeader(serverIp, hostRoot) {
		headers.host = serverIp;
		headers.origin = hostRoot;

		if(headers.hasOwnProperty('referer'))
			headers.referer = headers.referer.replace(headers.host, serverIp);

		headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36';
	}
}

function removeUrlParameterSensitiveData(url) {
	url = urlparse(url, true);
	delete url.query.api_token;
	delete url.query.api_starttime;

	return url.toString();
}

module.exports = exports = agent;