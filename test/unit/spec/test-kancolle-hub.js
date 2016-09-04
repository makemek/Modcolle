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
	
	it('request for kancolle server by world id should return a correct server', function() {
		var worldId = '9999', fakeKancolleServer = new Server(worldId);
		servers[worldId] = fakeKancolleServer;
		assert.deepEqual(hub.getServer(worldId), fakeKancolleServer, 'should return the same server');
		delete servers[worldId];
	})

	it('request for kancolle server by host name should return a correct server', function() {
		var host = 'www.example.com', fakeKancolleServer = new Server('9999999', host);
		servers[host] = fakeKancolleServer;
		assert.deepEqual(hub.getServer(host), fakeKancolleServer, 'should return the same server');
		delete servers[host];
	})

	it('request non-existent server should return undefined', function() {
		const invalidValue = null;
		assert.isUndefined(hub.getServer(invalidValue), 'should return nothing');
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
		var player = {
			isBan: false,
			api_token: 'abc',
			api_start_time: '123'
		}
		var worldId = 1;
		this.stub(game, 'getWorldServerId').returns(createPromise(worldId));
		this.stub(Server.prototype, 'generateApiToken').returns(Promise.resolve(player))

		hub.launch({})
		.then(function(url) {
			var server = hub.getServer(worldId);
			var url = urlparse(url, true);
			var expectUrl = urlparse(server.host);
			assert.equal(url.protocol, 'http:', 'should have http protocol');
			assert.equal(url.host, expectUrl.host, 'should have the host');
			assert.equal(url.pathname, '/kcs/mainD2.swf', 'mainD2.swf should reside in /kcs/');
			assert.equal(url.query.api_token, player.api_token, 'should have api token');
			assert.equal(url.query.api_starttime, player.api_start_time, 'should have api start time');
			done();
		})
		.catch(done)
	}))

	it('should return correct url to old player who is banned from the game', sinon.test(function(done) {
		this.stub(game, 'getWorldServerId').returns(createPromise(1));
		this.stub(Server.prototype, 'generateApiToken')
		.returns(Promise.resolve({isBan: true}));

		hub.launch({})
		.then(function(url) {
			assert.equal('http://203.104.209.7/kcs/ban.swf', url, 'url should match');
			done();
		})
		.catch(done);
	}))
})

function createPromise(resolveValue) {
	return new Promise(function(resolve, reject) {
		resolve(resolveValue);
	})
}