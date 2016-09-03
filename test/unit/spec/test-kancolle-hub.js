'use strict';

const hub = require(SRC_ROOT + '/kancolle/hub');
const servers = require(SRC_ROOT + '/kancolle/server/');
const Server = require(SRC_ROOT + '/kancolle/server/server');
const urlparse = require('url-parse');
const sinon = require('sinon');
const game = require(SRC_ROOT + '/kancolle/game');

describe('Kancolle hub', function() {

	it('return correcct game ID', function() {
		const ID = 854854;
		assert.equal(hub.appId, ID, 'Kancolle app id should be ' + ID);
	})
	
	it('request an existing server should return an expected server', function() {
		const BOUNDARY = [1,20];
		for(var n = BOUNDARY[0]; n <= BOUNDARY[1]; ++n) {
			var accessPropertyName = 'World_' + n;
			assert.isTrue(servers.hasOwnProperty(accessPropertyName), accessPropertyName + ' not found');
			assert.deepEqual(hub.getServer(n), servers[accessPropertyName], n + ' should be the same server');
		}
	})

	it('request non-existent server should throw ReferenceError', function() {
		const invalidValue = -1;
		assert.throws(function() {
			hub.getServer(invalidValue);
		}, ReferenceError, null, 'should throw misconfiguration error');
	})

	it('should return correct url to new player who launch the game', sinon.test(function(done) {
		this.stub(game, 'getWorldServerId').returns(createPromise(0));
		hub.launch({})
		.then(function(url) {
			assert.equal('http://203.104.209.7/kcs/world.swf', url, 'url should match');
			done();
		})
		.catch(done)
	}))

	it('should return correct url to old player who launch the game', sinon.test(function(done) {
		var api_token = 'abc', api_starttime = '123';
		var worldId = 1;
		this.stub(game, 'getWorldServerId').returns(createPromise(worldId));
		this.stub(Server.prototype, 'generateApiToken', function(gadgetInfo, callback) {
			callback(null, false, api_token, api_starttime);
		});
		hub.launch({})
		.then(function(url) {
			var server = hub.getServer(worldId);
			url = urlparse(url, true);
			assert.equal(url.protocol, 'http:', 'should have http protocol');
			assert.equal(url.host, server.host, 'should have the host');
			assert.equal(url.pathname, '/kcs/mainD2.swf', 'mainD2.swf should reside in /kcs/');
			assert.equal(url.query.api_token, api_token, 'should have api token');
			assert.equal(url.query.api_starttime, api_starttime, 'should have api start time');
			done();
		})
		.catch(done)
	}))

	it('should return correct url to old player who is banned from the game', sinon.test(function(done) {
		this.stub(game, 'getWorldServerId').returns(createPromise(1));
		this.stub(Server.prototype, 'generateApiToken', function(gadgetInfo, callback) {
			callback(null, true);
		});
		hub.launch({})
		.then(function(url) {
			assert.equal('http://203.104.209.7/kcs/ban.swf', url, 'url should match');
			done();
		})
		.catch(done);
	}))

	it('should return error if cannot generate api token for some reason', sinon.test(function(done) {
		var expectedError = new Error('some internal error occurred');
		this.stub(game, 'getWorldServerId').returns(createPromise(1));
		this.stub(Server.prototype, 'generateApiToken', function(gadgetInfo, callback) {
			callback(expectedError)
		});

		hub.launch({})
		.catch(function(error) {
			if(error.message != expectedError.message)
				return done(error);
			assert.deepEqual(error, expectedError);
			done();
		})
	}))

})

function createPromise(resolveValue) {
	return new Promise(function(resolve, reject) {
		resolve(resolveValue);
	})
}