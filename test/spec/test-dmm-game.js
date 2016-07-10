'use strict';

const DmmGame = require('../../scripts/model/dmmGame');
const Account = require('../../scripts/model/dmmAccount');
const sinon = require('sinon');
const async = require('async');
const rp = require('request-promise');

describe('DMM game abstract class', function() {

	var dmmGame, account;

	beforeEach(function() {
		account = new Account('poi@poi.com', 'poipoi');
		dmmGame = new DmmGame(account);
	})

	it('get expected gadget information', sinon.test(function(done) {
		var fakeCookie = 'ccky=1; a=1; b=2;';
		var fakeAppId = -1;
		var stubCookie = this.stub(account, 'getCookie').returns(fakeCookie);
		var stubAppId = this.stub(dmmGame, '_getAppId').returns(fakeAppId);
		var stubPreload = this.stub(dmmGame, '_preload', function() {done()});
		var httpRequest = this.stub(rp, 'get').returns(getFakeResponse());

		dmmGame.start(function(gadgetInfo) {
			var rpParam = httpRequest.firstCall.args[0];
			assert.equal(rpParam.uri, 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=' + fakeAppId, 'http url should match');
			assert.equal(rpParam.headers.cookie, fakeCookie, 'cookie should not be altered');

			var expectedParsedGadget = {
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

			assert.deepEqual(gadgetInfo, expectedParsedGadget, 'gadgetInfo should have the same expected properties and values');	
			done();
		});
	}))
})

function getFakeResponse() {
	var htmlBody =
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
	return {
		then: function(htmlCallback) { htmlCallback(htmlBody); return this; },
		catch: function() {}
	}
}
