'use strict';

const settings = require('nconf');
const request = require('request');
const path = require('path');
const urljoin = require('url-join');
const urlparse = require('url-parse');
const agentLog = require('winston').loggers.get('agent');
const inherit = require('inherit');

const kancolleExternal = require('../external');

var KancolleServer = {

	__constructor: function(host) {
		this.host = host;
	},

	download: function(res, url, onResponse) {
		var parsedUrl = removeUrlParameterSensitiveData(url);

		agentLog.info('Download: ' + parsedUrl);
		agentLog.verbose('Remove sensitive data in URL parameters');
		agentLog.verbose('Parsed URL: ' + parsedUrl);

		var forgeHeader = forgeKancolleHttpRequestHeader(this);
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
			headers: forgeKancolleHttpRequestHeader(this, req.headers),
			encoding: returnResponseAsBuffer
		}, onResponse);
	}
}

var staticMethods = {
	load: function(res, path2file, onError) {
		var file = path.resolve(path.join(settings.get('KANCOLLE_BASE_DIR'), path2file));
		agentLog.debug('resolve path: %s', file);
		agentLog.info('Load file: ' + file);
		return res.sendFile(file, {}, onError);
	}
}

function forgeKancolleHttpRequestHeader(self, httpHeader) {
	agentLog.verbose('Forge HTTP header to match with HTTP request from browser');
	agentLog.debug(self.host)
	var headers = httpHeader || {};
	modifyHeader(self.host, kancolleExternal.host());
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
		agentLog.debug(headers);
	}
}

function removeUrlParameterSensitiveData(url) {
	url = urlparse(url, true);
	delete url.query.api_token;
	delete url.query.api_starttime;

	return url.toString();
}

module.exports = exports = inherit(KancolleServer, staticMethods);