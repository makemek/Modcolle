var inherit = require('inherit');
var urljoin = require('url-join');
var settings = require('../settings');

var kancolleExternal = {
	kcsResource: function(url) {
		var baseDir = 'kcs';
		var protocol = 'http://';
		var fullUrl = urljoin(protocol + settings.MY_WORLD_SERVER, baseDir, url);
		return fullUrl;
	}
}

module.exports = exports = kancolleExternal;