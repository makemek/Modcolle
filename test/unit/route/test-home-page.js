'use strict';

const request = require('supertest-as-promised');
const app = require(SRC_ROOT);
const cheerio = require('cheerio');
const validator = require('validator');
const urlparse = require('url-parse');

describe('/index', function() {

	it('if not logged in, render a html page', done => {
		request(app)
		.get('/')
		.expect(200)
		.expect('content-type', /html/)
		.end(done);
	})

	it('if already logged in, launch Kancolle', done => {
		request(app)
		.post('/login')
		.expect(302)
		.expect('location', '/')
		.send({username: 'someone', password: 'password'})
		.then(res => {
			return request(app)
			.get('/')
			.set('cookie', res.headers['set-cookie'])
			.expect(200)
		})
		.then(res => {
			var startupFiles = ['mainD2.swf', 'ban.swf', 'world.swf']
			let $ = cheerio.load(res.text);
			var url = $('#game').attr('data');

			assert.isTrue(validator.isURL(url), 'should be a url');
			var matchWithStartupFiles = /mainD2\.swf|ban\.swf|world\.swf/.test(url);
			assert.isTrue(matchWithStartupFiles, 'should match with any kancolle startup files');
			done();
		})
		.catch(done)
	})
})