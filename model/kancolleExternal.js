var inherit = require('inherit');
var urljoin = require('url-join');
var settings = require('../settings');

var kancolleExternal = {
	kcsResource: function(url) {
		var baseDir = 'kcs';
		var fullUrl = urljoin(this.host(), baseDir, url);
		return fullUrl;
	},

	api: function(url) {
		var baseDir = 'kcsapi';
		var fullUrl = urljoin(this.host(), baseDir, url);
		return fullUrl;
	},

	host: function() {
		var protocol = 'http';
		return protocol + '://' + settings.MY_WORLD_SERVER;
	}
}

module.exports = exports = kancolleExternal;