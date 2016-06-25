'use strict';

const agent = require('../../scripts/model/agent');
const sinon = require('sinon');
const nconf = require('nconf');
const request = require('request');
const kancolleExternal = require('../../scripts/model/kancolleExternal');

describe('kancolle agent', function() {

	var config, configBaseDir, configServer;
	const KANCOLLE_CONFIG = {
		baseDir: 'base',
		serv: '0.0.0.0'
	}

	beforeEach(function() {
		config = sinon.stub(nconf, 'get');
		configBaseDir = config.withArgs('KANCOLLE_BASE_DIR').returns(KANCOLLE_CONFIG.baseDir);
		configServer = config.withArgs('MY_WORLD_SERVER').returns(KANCOLLE_CONFIG.serv);
	})

	afterEach(function() {
		config.restore();
	})

	it('load file locally', sinon.test(function() {
		const FILE = 'someFile';

		var res = {
			sendFile: function(file, arg, onError){}
		}
		var sendFile = sinon.stub(res, 'sendFile');
		var errorCallback = sinon.stub();

		agent.load(res, 'someFile', errorCallback);
		sinon.assert.calledOnce(sendFile);

		var args = sendFile.firstCall.args;
		assert.include(args, errorCallback, 'error callback not include');
		assert.include(args[0], KANCOLLE_CONFIG.baseDir);
		assert.include(args[0], FILE);
	}))

	it('download from network', sinon.test(function() {
		var sensitiveParams = '?api_token=abc&api_starttime=1234'
		var url = 'http://www.example.com';
		const KCS_URL = 'http://www.kcs.com';

		var res = sinon.spy();
		var callback = sinon.spy();
		var mockRes = {
			on: function() {
				return this;
			},

			pipe: function(_res) {
				return this;
			}
		}
		var httpGet = sinon.stub(request, 'get').returns(mockRes);
		sinon.stub(kancolleExternal, 'host').returns(KCS_URL);

		agent.download(res, url + sensitiveParams, callback);

		sinon.assert.calledOnce(httpGet);
		var param = httpGet.firstCall.args[0];
		expect(param.url).to.equal(url);
		expect(param.headers.host).to.equal(KANCOLLE_CONFIG.serv);
		expect(param.headers['x-requested-with']).to.match(/flash/i);
	}))

	it('call API', function() {

	})
})