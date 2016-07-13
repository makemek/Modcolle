'use strict';

const DmmGame = require('../../scripts/dmm/game');
const Account = require('../../scripts/dmm/account');
const sinon = require('sinon');
const async = require('async');
const rp = require('request-promise');

describe('DMM game abstract class', function() {

	var dmmGame, account;
	var stubCookie, stubAppId;

	beforeEach(function() {
		account = new Account('poi@poi.com', 'poipoi');
		dmmGame = new DmmGame(account);

		var fakeCookie = 'ccky=1; a=1; b=2;';
		var fakeAppId = -1;
		stubCookie = sinon.stub(account, 'getCookie').returns(fakeCookie);
		stubAppId = sinon.stub(dmmGame, '_getAppId').returns(fakeAppId);
	})

	afterEach(function() {
		stubCookie.restore();
		stubAppId.restore();
	})

	it('get expected gadget information', sinon.test(function(done) {
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
		var httpRequest = this.stub(rp, 'get').returns(getFakeResponse(response));

		dmmGame.start(function(error, gadgetInfo) {
			var rpParam = httpRequest.firstCall.args[0];
			assert.equal(rpParam.uri, 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=' + dmmGame._getAppId(), 'http url should match');
			assert.equal(rpParam.headers.cookie, account.getCookie(), 'cookie should not be altered');

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

			assert.isNull(error);
			assert.deepEqual(gadgetInfo, expectedParsedGadget, 'gadgetInfo should have the same expected properties and values');	
			done();
		});
	}))

	it('should return error when there is no gadgetInfo variable', sinon.test(function() {
		var httpRequest = this.stub(rp, 'get').returns(getFakeResponse(''));
		dmmGame.start(function(error, gadgetInfo) {
			assert.isUndefined(gadgetInfo, 'gadget info should not have any value');
			assert.isNotNull(error, 'there should be an error');
			assert.isDefined(error, 'error should be defined');
		})
	}))
})

function getFakeResponse(htmlBody) {
	return {
		then: function(htmlCallback) { htmlCallback(htmlBody); return this; },
		catch: function() {}
	}
}
