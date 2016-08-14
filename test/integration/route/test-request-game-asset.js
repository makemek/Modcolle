'use strict';

const async = require('async');
const request = require('supertest-as-promised');
const sprintf = require('sprintf-js').sprintf;
const app = require('../../../src/');
const sinon = require('sinon');
const nock = require('nock');
const Agent = require('../../../src/kancolle/server/server');
const path = require('path');

describe('request kancolle world server image', function() {

	var serverIp = ipPattern();

	async.forEach(serverIp, function(ipAddress) {
		it('by ip address ' + ipAddress, sinon.test(function(done) {
			var agentStub = this.stub(Agent.prototype, '__constructor', function() {
				this.host = ipAddress;
			});
			var loadStub = this.stub(Agent, 'load', function(res) {
				res.sendStatus(200);
			});

			var uri = sprintf('/resources/image/world/%s_t.png', '001_002_003_004');
			request(app)
			.get(uri)
			.expect(200)
			.then(function(res) {
				var imageNamePattern = /\d{3}_\d{3}_\d{3}_\d{3}_t\.png/
				var imagePath = loadStub.firstCall.args[1];
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

		var loadStub = this.stub(Agent, 'load', function(res) {
			res.sendStatus(200);
		});

		var uri = sprintf('/resources/image/world/%s_t.png', hostname);
		
		request(app)
		.get(uri)
		.expect(200)
		.then(function(res) {
			var imagePath = loadStub.firstCall.args[1];
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
})

describe('request resource from kancolle server', function() {

	var agent;

	before(function() {
		agent = new Agent('1.1.1.1');
	})

	async.forEach(['file.swf', 'sound/file.mp3', 'file.png'], function(file) {

		it('request ' + file, function(done) {
			var host = agent.host;
			nockKancolleResource(agent.host, file);
			
			request(app)
			.get('/' + file)
			.then(function(res) {
				done();
			})
			.catch(done)
		})
	})

	function nockKancolleResource(host, file) {
		nock('http://' + host)
		.get('/kcs/' + file)
		.reply(200)
	}
})