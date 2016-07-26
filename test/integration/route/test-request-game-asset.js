'use strict';

const async = require('async');
const request = require('supertest-as-promised');
const sprintf = require('sprintf-js').sprintf;
const modcolle = require('../../../src/modcolle');
const nconf = require('nconf');
const sinon = require('sinon');
const nock = require('nock');
const agent = require('../../../src/kancolle/agent');
const path = require('path');

/**
 * When kancolle request for server image
 * It requests the following format http://<server>/resources/image/world/<world>_t.png
 * <server> is the player's server host name or ip address
 * <world> is a file name generated from <server> string
 *
 * If <server> is an ip address, <world> replace '.' with '_' and include 3 zerofills.
 * For example, 1.1.11.111 will be 001_001_011_111, 1.2.3.4 will be 001_002_003_004
 * If <server> is a host name, <world> replace '.' with '_' only
**/
describe('request kancolle world server image', function() {

	var serverIp = ipPattern();
	var app;

	before(function() {
		app = new modcolle().app;
	})

	async.forEach(serverIp, function(ipAddress) {
		it('by ip address ' + ipAddress, sinon.test(function(done) {
			nockServerImage(ipAddress);

			var config = this.stub(nconf, 'get');
			var loadSpy = this.spy(agent, 'load');

			config.withArgs('MY_WORLD_SERVER').returns(ipAddress);
			config.withArgs('KANCOLLE_BASE_DIR').returns('*no_where*');

			var uri = sprintf('/resources/image/world/%s_t.png', '001_002_003_004');
			request(app)
			.get(uri)
			.expect(200)
			.then(function(res) {
				var imageNamePattern = /\d{3}_\d{3}_\d{3}_\d{3}_t\.png/
				var imagePath = loadSpy.firstCall.args[1];
				var imageName = path.basename(imagePath);

				assert.startsWith(imagePath, '/resources/image/world');
				assert.match(imageName, imageNamePattern);

				var resultIp = imageName.replace('_t.png', '').split('_').map(Number);
				var expectIp = ipAddress.split('.').map(Number);
				assert.deepEqual(resultIp, expectIp);
				done();
			})
			.catch(done)
		}))
	})

	it('by host name', sinon.test(function(done) {
		var hostname = 'www.example.com';
		var expectedImageName = 'www_example_com_t.png';

		var config = this.stub(nconf, 'get');
		var loadSpy = this.spy(agent, 'load');

		config.withArgs('MY_WORLD_SERVER').returns(hostname);
		config.withArgs('KANCOLLE_BASE_DIR').returns('*no_where*');

		var uri = sprintf('/resources/image/world/%s_t.png', hostname);
		nockServerImage(hostname);
		request(app)
		.get(uri)
		.expect(200)
		.then(function(res) {
			var imagePath = loadSpy.firstCall.args[1];
			var imageName = path.basename(imagePath);

			assert.startsWith(imagePath, '/resources/image/world');
			assert.equal(imageName, expectedImageName)
			done();
		})
		.catch(done);
	}))

	function ipPattern() {
		return [
		'1.1.1.1', '11.1.1.1', '111.1.1.1',
		'1.11.1.1', '1.111.1.1',
		'1.1.11.1', '1.1.111.1',
		'1.1.1.11', '1.1.1.111'
		]
	}

	function nockServerImage(host) {
		nock('http://' + host)
		.get(/\/resources\/image\/world\/.*\_t\.png/)
		.reply(200)
	}
})

describe('request resource from kancolle server', function() {

	var app;

	before(function() {
		app = new modcolle().app;
	})

	async.forEach(['file.swf', 'sound/file.mp3', 'file.png'], function(file) {

		it('request ' + file, sinon.test(function(done) {
			var fakeKancolleServerIp = '1.1.1.1';
			var config = this.stub(nconf, 'get');
			config.withArgs('MY_WORLD_SERVER').returns(fakeKancolleServerIp);
			config.withArgs('KANCOLLE_BASE_DIR').returns('*no_where*');

			nockKancolleResource(fakeKancolleServerIp, file);
			
			request(app)
			.get('/' + file)
			.then(function(res) {
				done();
			})
			.catch(done)
		}))
	})

	function nockKancolleResource(host, file) {
		nock('http://' + host)
		.get('/kcs/' + file)
		.reply(200)
	}
})