'use strict';

const settings = require('nconf');
const request = require('request');
const path = require('path');
const urljoin = require('url-join');
const urlparse = require('url-parse');
const appLog = require('winston').loggers.get('app');

const kancolleExternal = require('./kancolleExternal');

var agent = {

	load: function(res, path2file, onError) {
		var file = path.resolve(path.join(__SERVER_ROOT, settings.get('KANCOLLE_BASE_DIR'), path2file));
		appLog.info('Load file: ' + file);
		return res.sendFile(file, {}, onError);
	},

	download: function(res, url, onResponse) {
		var parsedUrl = removeUrlParameterSensitiveData(url);
		appLog.verbose('Remove sensitive data in URL parameters');
		appLog.verbose('Parsed URL: ' + parsedUrl);
		return request.get(parsedUrl).on('response', onResponse).pipe(res);
	},

	apiRequest: function(_url, req, onResponse) {
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
	var headers = cloneHeader(httpHeader);
	modifyHeader(settings.MY_WORLD_SERVER, kancolleExternal.host());
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
		headers['host'] = serverIp;
		headers['origin'] = hostRoot;
		headers['referer'] = httpHeader.referer.replace(httpHeader.host, serverIp);
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