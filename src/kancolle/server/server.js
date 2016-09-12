'use strict';

const KANCOLLE_BASE_DIR = process.env.KANCOLLE_BASE_DIR;
const request = require('request');
const rp = require('request-promise');
const path = require('path');
const urljoin = require('url-join');
const urlparse = require('url-parse');
const agentLog = require('winston').loggers.get('agent');
const osapi = require('../../dmm/osapi');
const sprintf = require('sprintf-js').sprintf;

const kancolleExternal = require('../external');

class KancolleServer {

	constructor(worldId, host) {
		this.worldId = worldId;
		this.host = host;
	}

	download(url) {
		agentLog.info('Download: ' + url);
		agentLog.verbose('Remove sensitive data in URL parameters');
		var parsedUrl = removeUrlParameterSensitiveData(url);
		agentLog.debug('Parsed URL: ' + parsedUrl);

		return request.get({
			url: parsedUrl,
			headers: {'x-requested-with': 'ShockwaveFlash/22.0.0.192'}
		});
	}

	apiRequest(_url, req, onResponse) {
		agentLog.info('POST URL: ' + _url);
		request.post({
			url: _url, 
			form: req.body,
			headers: forgeKancolleHttpRequestHeader(this, req.headers),
			gzip: true
		}, onResponse);
	}

	generateApiToken(gadgetInfo) {
		const url = sprintf('%s/kcsapi/api_auth_member/dmmlogin/%s/1/%d', this.host, gadgetInfo.VIEWER_ID, Date.now());
		return osapi.proxyRequest(url, gadgetInfo).then(response => {
			var body = response.body;
			body = body.replace('svdata=', '');
			body = body.replace(/\\/g, '');
			var apiResponse = JSON.parse(body);
			var isBan = apiResponse.api_result == 301;

			var data = {
				isBan: isBan,
				api_token: apiResponse.api_token,
				api_start_time: apiResponse.api_starttime
			}
			return Promise.resolve(data);
		})
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

module.exports = exports = KancolleServer;