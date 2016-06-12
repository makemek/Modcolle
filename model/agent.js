var settings = require('../settings');
var request = require('request');
var path = require('path');

var agent = {

	load: function(res, path2file, onError) {
		var file = path.resolve(path.join(__SERVER_ROOT, settings.KANCOLLE_BASE_DIR, path2file));
		console.log('Load file: ' + file);
		return res.sendFile(file, {}, onError);
	},

	download: function(res, url, onResponse) {
		return request.get(url, onResponse).pipe(res);
	},

	postRequest: function(_url, parameters, onResponse) {
		return request.post({
			url: _url, 
			form: parameters
		}, onResponse);
	}
}

module.exports = exports = agent;