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

	apiRequest(apiUrl, payload, initialHttpHeaders) {
		var fullUrl = urljoin(this.host, apiUrl);
		agentLog.info('call Kancolle API', fullUrl);
		return rp.post({
			url: fullUrl, 
			form: payload,
			headers: forgeKancolleHttpRequestHeader(fullUrl, initialHttpHeaders),
			gzip: true
		});
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

function forgeKancolleHttpRequestHeader(fullUrl, initialHttpHeaders = {}) {
	agentLog.verbose('Forge HTTP header to match with HTTP request from browser');
	agentLog.debug('URL', fullUrl);
	var headers = initialHttpHeaders;
	modifyHeader(fullUrl);
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

	function modifyHeader(fullUrl) {
		var url = urlparse(fullUrl);
		headers.host = url.host;
		headers.origin = url.origin;

		delete headers['referer'];
		headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36';
		agentLog.debug('modified http headers', headers);
	}
}

function removeUrlParameterSensitiveData(url) {
	url = urlparse(url, true);
	delete url.query.api_token;
	delete url.query.api_starttime;

	return url.toString();
}

module.exports = exports = KancolleServer;