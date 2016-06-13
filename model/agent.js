'use strict';

const settings = require('../settings');
const request = require('request');
const path = require('path');
const urljoin = require('url-join');

const kancolleExternal = require('./kancolleExternal');

var agent = {

	load: function(res, path2file, onError) {
		var file = path.resolve(path.join(__SERVER_ROOT, settings.KANCOLLE_BASE_DIR, path2file));
		console.log('Load file: ' + file);
		return res.sendFile(file, {}, onError);
	},

	download: function(res, url, onResponse) {
		return request.get(url, onResponse).pipe(res);
	},

	postRequest: function(_url, req, onResponse) {
		request.post({
			url: _url, 
			form: req.body,
			headers: forgeKancolleHttpRequestHeader(req.headers)
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
	}
}

module.exports = exports = agent;