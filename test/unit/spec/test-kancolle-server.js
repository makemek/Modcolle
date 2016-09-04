'use strict';

const Agent = require(SRC_ROOT + '/kancolle/server/server');
const sinon = require('sinon');
const request = require('request');
const kancolleExternal = require(SRC_ROOT + '/kancolle/external');
const path = require('path');
const osapi = require(SRC_ROOT + '/dmm/osapi');

describe('kancolle server', function() {

	var agent;
	const KANCOLLE_CONFIG = {
		baseDir: 'base',
		serv: 'http://0.0.0.0'
	}

	beforeEach(function() {
		agent = new Agent(1, KANCOLLE_CONFIG.serv);
	})

	it('load file locally', sinon.test(function() {
		const FILE = 'somefile.somthing';

		var res = {
			sendFile: function(){}
		}
		var sendFile = this.stub(res, 'sendFile');
		var errorCallback = this.stub();

		Agent.load(res, FILE, errorCallback);
		sinon.assert.calledOnce(sendFile);

		var args = sendFile.firstCall.args;
		assert.include(args, errorCallback, 'error callback not include');
		assert.include(args[0], process.env.KANCOLLE_BASE_DIR, 'no kancolle base directory');
		assert.equal(path.basename(args[0]), FILE, 'load a different filename from what expected');
		assert.isTrue(path.isAbsolute(args[0]), 'path is relative');
	}))

	it('download from network', sinon.test(function() {
		var sensitiveParams = '?api_token=abc&api_starttime=1234'
		var url = 'http://www.example.com';
		const KCS_URL = 'http://www.kcs.com';

		var res = this.spy();
		var callback = this.spy();
		var mockRes = {
			on: function() {
				return this;
			},

			pipe: function(_res) {
				return this;
			}
		}
		var httpGet = this.stub(request, 'get').returns(mockRes);
		var kancolleHost = this.stub(kancolleExternal, 'host').returns(KCS_URL);

		agent.download(res, url + sensitiveParams, callback);

		sinon.assert.calledOnce(httpGet);
		var param = httpGet.firstCall.args[0];
		expect(param.url).to.equal(url);
		expect(param.headers.host).to.equal(KANCOLLE_CONFIG.serv);
		expect(param.headers['x-requested-with']).to.match(/flash/i);
	}))

	it('call API', sinon.test(function() {
		var url = 'http://api.example.com';
		var req = {
			body: {},
			headers: {someHeader: 'header'}
		}
		var reqStub = this.stub(req);
		var httpPost = this.stub(request, 'post');
		this.stub(kancolleExternal, 'host').returns(KANCOLLE_CONFIG.serv);

		agent.apiRequest(url, reqStub, function(){});

		sinon.assert.calledOnce(httpPost);
		var postArgs = httpPost.firstCall.args[0];
		expect(postArgs.url).to.equal(url);
		expect(postArgs.headers.host).to.equal(KANCOLLE_CONFIG.serv);
		expect(postArgs.headers.origin).to.include(KANCOLLE_CONFIG.serv);
		expect(postArgs.headers['connection']).to.not.exist;
		expect(postArgs.headers['content-length']).to.not.exist;
		expect(postArgs.headers['content-type']).to.not.exist;
		expect(postArgs.headers.someHeader).to.equal(req.headers.someHeader);
	}))

	it('generate api token for non-banned player', function(done) {
		agent.generateApiToken({VIEWER_ID: 12345678, ST: 'xxxxxxxxx'})
		.then(player => {
			assert.isFalse(player.isBan, 'should not get banned');
			done();
		})
		.catch(done);
	})

	it('NOT generate api token for banned player', sinon.test(function(done) {
		var body = 'svdata=' + JSON.stringify({api_result: 301})
		var stub = this.stub(osapi, 'proxyRequest').returns(Promise.resolve({body: body}));
		agent.generateApiToken({})
		.then(player => {
			assert.isTrue(player.isBan, 'this player should be banned');
			assert.isUndefined(player.api_token, 'no api token should be given');
			assert.isUndefined(player.api_start_time, 'no api start time should be given');
			done();
		})
		.catch(done);
	}))

})
