'use strict';

const agent = require('../../scripts/model/agent');
const sinon = require('sinon');
const nconf = require('nconf');

describe('kancolle agent', function() {

	it('load file locally', sinon.test(function() {
		const FILE = 'someFile';
		const BASE_DIR = 'base';

		var configMock = sinon.mock(nconf);
		configMock.expects('get').withArgs('KANCOLLE_BASE_DIR').returns(BASE_DIR);

		var res = {
			sendFile: function(file, arg, onError){}
		}
		var sendFile = sinon.stub(res, 'sendFile');
		var errorCallback = sinon.stub();

		agent.load(res, 'someFile', errorCallback);
		sinon.assert.calledOnce(sendFile);

		var args = sendFile.firstCall.args;
		assert.include(args, errorCallback, 'error callback not include');
		assert.include(args[0], BASE_DIR);
		assert.include(args[0], FILE);
	}))

	it('download with valid url', function() {

	})

	it('download with invalid url', function() {

	})

	it('call api with valid url', function() {

	})

	it('call api with invalid url', function() {
		
	})
})