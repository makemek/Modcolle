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

	it('get expected gadget information', sinon.test(function() {
		var fakeCookie = 'ccky=1; a=1; b=2;';
		var fakeAppId = -1;
		var stubCookie = this.stub(account, 'getCookie').returns(fakeCookie);
		var stubAppId = this.stub(dmmGame, '_getAppId').returns(fakeAppId);
		var procedure = this.stub(async, 'waterfall');

		dmmGame.start();

		assert.isTrue(procedure.called);
		var task = procedure.firstCall.args[0];
		var taskAppInfo = task[0];
		var spyDone = this.spy();
		var httpRequest = this.stub(rp, 'get').returns(getFakeResponse());

		taskAppInfo(spyDone);

		assert.isTrue(stubCookie.called);
		assert.isTrue(stubAppId.called);

		var rpParam = httpRequest.firstCall.args[0];
		assert.isTrue(spyDone.called, 'http GET should be called');
		assert.equal(rpParam.uri, dmmGame.getUrl(), 'http url should match');
		assert.equal(rpParam.headers.cookie, fakeCookie, 'cookie should not be altered');

		var doneArgs = spyDone.firstCall.args;
		assert.isNull(doneArgs[0], 'there should be no error');
		var gadgetInfo = doneArgs[1];
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
