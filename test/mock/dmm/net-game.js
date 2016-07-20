'use strict';

const nock = require('nock');

const HOST = 'http://www.dmm.com';

nock(HOST, {
	reqheaders: {
		cookie: function(headerValue) {
			var hasSession = /INT_SESID\s*=\s*/gi.test(headerValue);
			var renderPageInJapanese = /cklg\s*=\s*ja/gi.test(headerValue);
			var loginFromJapan = /ccky\s*=\s*1/gi.test(headerValue);

			return hasSession && renderPageInJapanese && loginFromJapan;
		}
	}
})
.get(function(uri) {
	return /\/netgame\/social\/-\/gadgets\/=\/app_id=\d+/gi.test(uri);
})
.reply(200, function() {
		var response = 
		`
		//<![CDATA[
		var foo = {};
		var bar = {a:1, b:2, c:3}

		var gadgetInfo = {
		    VIEWER_ID : 123,
		    OWNER_ID  : 123,
		    APP_ID    : 456,
		    URL       : "http://www.example.com",
		    FRAME_ID  : "game_frame",
		    ST        : "0123456789abcdefghijklmnopqrstuvwxyz",
		    TIME      : 1467570034,
		    TYPE      : "",
		    SV_CD     : "xx_xxxxxx"
		};
		//]]>
		`
		return response;
})