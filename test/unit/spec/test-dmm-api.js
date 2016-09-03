'use strict';

const DmmApi = require(SRC_ROOT + '/dmm/osapi');
const sinon = require('sinon');
const async = require('async');
const rp = require('request-promise');
const netGame = require('../mock/dmm/net-game');
const osapiNock = require('../mock/dmm/osapi');

describe('DMM API (OSAPI)', function() {

	var fakeGameId, fakeCookie;

	beforeEach(function() {
		fakeGameId = 0;
		fakeCookie = 'INT_SESID=abcd; ckcy=1; cklg=ja; a=1; b=2;';
	})

	it('get expected gadget information', sinon.test(function(done) {

		var httpRequest = this.spy(rp, 'get');

		DmmApi.getGameInfo(fakeGameId, fakeCookie)
		.then(gadgetInfo => {
			var rpParam = httpRequest.firstCall.args[0];
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

			assert.equal(rpParam.uri, 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=' + fakeGameId, 'http url should match');
			assert.equal(rpParam.headers.cookie, fakeCookie, 'cookie should not be altered');
			assert.deepEqual(gadgetInfo, expectedParsedGadget, 'gadgetInfo should have the same expected properties and values');	
			done();
		})
		.catch(done);
	}))

	it('should return error when there is no gadgetInfo variable', sinon.test(function(done) {
		var httpRequest = this.stub(rp, 'get')
		.returns(getFakeResponse(''));

		DmmApi.getGameInfo(fakeGameId, fakeCookie)
		.then(done)
		.catch(error => {
			assert.isDefined(error);
			done();
		})
	}))

	describe('proxy request', function() {
		var securityToken = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/=+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/=+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/=+abcdefghijklmnopqrstuvwxy';
		it('should make proxy request to the target url', function(done) {
			DmmApi.proxyRequest('http://www.example.com', {ST: securityToken})
			.then(response => {
				assert.isObject(response, 'response should be an object');
				assert.isTrue(response.hasOwnProperty('body'), 'should have a body (.body) property');
				assert.isDefined(response.hasOwnProperty('headers'), 'should have a headers (.headers) property');
				assert.isDefined(response.hasOwnProperty('rc'), 'should have http status (.rc) property');
				assert.isNumber(response.rc, 'http status value (.rc) should be a number');
				done();
			})
			.catch(done);
		})

		it('invalid url ', function(done){
			DmmApi.proxyRequest('http://invlidUrl', {ST: securityToken})
			.then(response => {
				assert.equal(response.body, 'request error');
				done();
			})
			.catch(done);
		})

		it('invalid security token', function(done) {
			DmmApi.proxyRequest('', {ST: ''})
			.then(done)
			.catch(error => {
				assert.equal(error.statusCode, 500, 'http status code should be internal server error (500)');
				done();
			})
		})
	})

})

function getFakeResponse(htmlBody) {
	return {
		then: function(htmlCallback) { htmlCallback(htmlBody); return this; },
		catch: function() {}
	}
}
