'use strict';

const async = require('async');
const request = require('supertest-as-promised');
const sprintf = require('sprintf-js').sprintf;
const app = require(SRC_ROOT);
const sinon = require('sinon');
const nock = require('nock');
const Server = require(SRC_ROOT + '/kancolle/server/server');
const kancolle = require(SRC_ROOT + '/kancolle/');
const path = require('path');
const URL = require('url-parse');
const urljoin = require('url-join');


describe('request kancolle world server image', function() {

	[
	{case: 'ip address', input: {host: 'http://1.0.1.0', worldImg: '001_000_001_000_t.png'}},
	{case: 'host name', input: {host: 'http://www.some.site.com', worldImg: 'www_some_site_com_t.png'}}
	].forEach(testcase => {
		it('match with ' + testcase.case, sinon.test(function(done) {
			var host = testcase.input.host;
			var worldImg = '/kcs/resources/image/world/' + testcase.input.worldImg;
			var fakeImagePngContent = Buffer.from('1234abcdef');
			var fakeKancolleServer = new Server(1, host);

			nock(host)
			.get(worldImg)
			  .reply(200, fakeImagePngContent, {
			  	server: 'nginx',
				  'content-type': 'image/png',
				  connection: 'close',
				  pragma: 'public',
				  'accept-ranges': 'bytes' 
				});

			this.stub(kancolle, 'getServer', _host => {
				var resultHostname = new URL(_host).hostname;
				var expectedHostname = new URL(host).hostname;
				assert.equal(resultHostname, expectedHostname, 'should have the same hostname');
				return fakeKancolleServer;
			})

			request(app)
			.get(worldImg)
			.expect(200)
			.expect('content-type', 'image/png')
			.then(res => {
				assert.equal(res.body.toString(), fakeImagePngContent.toString(), 'should be the same image');
				done();
			})
			.catch(done)
		}))
	})

	it('NOT match with any Kancolle server host name', sinon.test(function(done) {
		this.stub(kancolle, 'getServer').returns(undefined);
		request(app)
		.get('/kcs/resources/image/world/xxxxxxxxxxxx.png')
		.expect(400)
		.end(done)
	}))
})

describe('request resource from kancolle server', function() {

	var agent;

	before(function() {
		agent = new Agent('1.1.1.1');
	})

	async.forEach(['file.swf', 'sound/file.mp3', 'file.png'], function(file) {

		it('request ' + file, sinon.test(function(done) {
			var host = agent.host;
			
			request(app)
			.get('/' + file)
			.then(function(res) {
				var filepath = loadStub.firstCall.args[1];
				assert.include(path.normalize(filepath), path.normalize(file), 'should load the correct file');
				done();
			})
			.catch(done)
		}))
	})
})