'use strict';

const inherit = require('inherit');
const urljoin = require('url-join');
const MY_WORLD_SERVER = process.env.MY_WORLD_SERVER;

var kancolleExternal = {
	kcsResource: function(url) {
		const BASE_DIR = 'kcs';
		var fullUrl = urljoin(this.host(), BASE_DIR, url);
		return fullUrl;
	},

	api: function(url) {
		const BASE_DIR = 'kcsapi';
		var fullUrl = urljoin(this.host(), BASE_DIR, url);
		return fullUrl;
	},

	host: function() {
		const PROTOCOL = 'http';
		return PROTOCOL + '://' + MY_WORLD_SERVER;
	}
}

module.exports = exports = kancolleExternal;