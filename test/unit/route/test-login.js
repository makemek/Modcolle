'use strict';

const nockDmmAuth = require('../mock/dmm/auth');
const Cookie = require('tough-cookie').Cookie;
const request = require('supertest-as-promised');
const app = require(SRC_ROOT);

describe('/login', function() {
	
	var loginWithValidAccount, loginWithInvalidAccount;

	beforeEach(function() {
		loginWithValidAccount = request(app)
		.post('/login')
		.send({username: 'someone', password: 'password'})
		.expect(302)
		.expect('location', '/');
		loginWithInvalidAccount = request(app)
		.post('/login')
		.send({
			username: nockDmmAuth.badAccount.email,
			password: nockDmmAuth.badAccount.password})
		.expect(302)
		.expect('location', '/')
	})

	it('if login success, return a session', done => {
		loginWithValidAccount
		.then(res => {
			var cookies = res.headers['set-cookie'];
			assert.isDefined(cookies, 'should have cookie header');
			cookies = cookies.map(Cookie.parse);
			assert.equal(cookies.filter(cookie => {
				return cookie.key === 'connect.sid';
			}).length, 1, 'should have 1 session');
			done();
		})
		.catch(done)
	})

	it('if login fail, DONT return a session', done => {
		loginWithInvalidAccount
		.then(res => {
			var cookies = res.headers['set-cookie'];
			if(!cookies)
				return done();

			cookies = cookies.map(Cookie.parse);
			assert.equal(cookies.filter(cookie => {
				return cookie.key === 'connect.sid';
			}).length, 0, 'should have no session');
			done();
		})
		.catch(done)
	})
})
