'use strict';

const DmmAccount = require('../../src/dmm/account');
const sinon = require('sinon');
const rp = require('request-promise');
const sprintf = require("sprintf-js").sprintf
const async = require('async');
const dmmAuth = require('../mock/dmm/auth');

describe('DMM account', function() {

	var taskList, fakeAccount;
	beforeEach(sinon.test(function() {
		var procedure = this.stub(async, 'waterfall');
		fakeAccount = new DmmAccount('jon@example.com', '1234');
		fakeAccount.login();
		taskList = procedure.firstCall.args[0];
	}))

	it('empty email', sinon.test(function() {
		var account = new DmmAccount('', '1234');
		expectError(account);
		account = new DmmAccount('     ', '1234');
		expectError(account);
	}))

	it('empty password', sinon.test(function() {
		var email = 'john@example.com';
		var account = new DmmAccount(email, '');
		expectError(account);
		account = new DmmAccount(email, '      ');
		expectError(account);
	}))

	it('scrape login token from DMM login page', function(done) {		
		var scrpeTask = taskList[0];

		scrpeTask(function(error, DMM_TOKEN, DATA_TOKEN) {
			assert.isNull(error, 'should have no error');
			assert.equal(DMM_TOKEN, dmmAuth.token.dmm, 'DMM token should be equal');
			assert.equal(DATA_TOKEN, dmmAuth.token.data, 'data token should be equal');
			done();
		});
	})

	it('authroize token', sinon.test(function() {
		var taskAuthorize = taskList[1];
		var authroizedToken = mockAuthorizeDmmToken();
		var httpRequest = this.stub(rp, 'post').returns(authroizedToken.response);

		var spyDone = this.spy();
		var fake_dmm_token = 'dmm_token', fake_data_token = 'data_token';
		taskAuthorize(fake_dmm_token, fake_data_token, spyDone);
		assert.isTrue(spyDone.calledOnce);

		var returnVal = spyDone.firstCall.args;
		assert.isNull(returnVal[0]);
		assert.equal(returnVal[1].token, authroizedToken.fakeToken.token);
		assert.equal(returnVal[1].login_id, authroizedToken.fakeToken.login_id);
		assert.equal(returnVal[1].password, authroizedToken.fakeToken.password);

		var httpParam = httpRequest.firstCall.args[0];
		assert.include(httpParam.uri, 'https://www.dmm.com/my/-/login/ajax-get-token');
		assert.equal(httpParam.headers['DMM_TOKEN'], fake_dmm_token);
		assert.match(httpParam.headers['x-requested-with'], /XMLHttpRequest/i);
		assert.equal(httpParam.form['token'], fake_data_token);
	}))

	it('authentication success', sinon.test(function() {
		var taskAuthenticate = taskList[2];
		var auth = mockAuthentication(true);
		var httpRequest = this.stub(rp, 'post').returns(auth.response);

		var spyDone = this.spy();
		var tokenJson = {
			token: 'a',
			login_id: 'b',
			password: 'c'
		}
		taskAuthenticate(JSON.stringify(tokenJson), spyDone);
		assert.isTrue(spyDone.calledOnce);

		var returnVal = spyDone.firstCall.args;
		assert.isNull(returnVal[0], 'should have no errors (be null)');
		assert.isBoolean(returnVal[1], 'should indicate whether the login is success (email and password are correct)');
		assert.isTrue(returnVal[1], 'success should be true');

		var cookie = fakeAccount.getCookie();
		assert.equal(cookie, auth.fakeCookie, 'cookie should match and not altered');
		assert.include(cookie, auth.session, 'session cookie should be included');

		var httpParam = httpRequest.firstCall.args[0];
		assert.startsWith(httpParam.uri, 'https://www.dmm.com/my/-/login/auth');
		assertRememberMe();
		assertToken();


		function assertRememberMe() {
			['save_login_id', 'save_password', 'use_auto_login'].forEach(function(prop) {
				var msg = sprintf('inside http POST form should have property "%s" with integer either 0 or 1', prop);
				assert.isTrue(httpParam.form.hasOwnProperty(prop), msg);
				assert.isAtLeast(httpParam.form[prop], 0);
				assert.isAtMost(httpParam.form[prop], 1);
			});
		}

		function assertToken() {
			assert.equal(httpParam.form.token, tokenJson.token, 'token should be put into form.token');
			assert.equal(httpParam.form.login_id, fakeAccount.email, 'email should be put into form.login_id');
			assert.equal(httpParam.form.password, fakeAccount.password, 'password should be put into form.password');

			assert.isTrue(httpParam.form.hasOwnProperty(tokenJson.login_id), 'should have property named from token.login_id');
			assert.equal(httpParam.form[tokenJson.login_id], fakeAccount.email, 'should have the same value as email address');

			assert.isTrue(httpParam.form.hasOwnProperty(tokenJson.password), 'should have property named from token.password');
			assert.equal(httpParam.form[tokenJson.password], fakeAccount.password, 'should have the same value as password');
		}	
	})) 

	it('authentication fail due to incorrect email or password', sinon.test(function() {
		var taskAuthenticate = taskList[2];
		var auth = mockAuthentication(false);
		var httpRequest = this.stub(rp, 'post').returns(auth.response);

		var spyDone = this.spy();
		taskAuthenticate(JSON.stringify({}), spyDone);
		assert.isTrue(spyDone.calledOnce);

		var returnVal = spyDone.firstCall.args;
		assert.isNull(returnVal[0]);
		assert.isFalse(returnVal[1]);

		var cookie = fakeAccount.getCookie();
		assert.equal(cookie, auth.fakeCookie);
		assert.notInclude(cookie, auth.session);
	}));
})

function expectError(account) {
	var accountCallback = sinon.spy();

	account.login(accountCallback);

	sinon.assert.calledOnce(accountCallback);
	var error = accountCallback.args[0][0];
	expect(error).to.be.an('error');

	return error;
}

function mockAuthorizeDmmToken() {
	var fakeToken = {};
	fakeToken['token'] = '0123456789abcdef3333333333333333';
	fakeToken['login_id'] = '0123456789abcdef4444444444444444';
	fakeToken['password'] = '0123456789abcdef5555555555555555';

	return {
		fakeToken: fakeToken,
		response: {
			then: function(resultCallback) {
				resultCallback(fakeToken);
				return this;
			},
			catch: function(err) {return this;}
		}
	}
}

function mockAuthentication(success) {
	var fakeCookie = [
	'ckcy=2',
	'check_done_login=1'
	];
	var sessionCookie = 'INT_SESID=blahblahblah';
	var headers = {};
	headers['set-cookie'] = fakeCookie;

	var thenFunc, catchFunc;
	if(success) {
		var errorResponse = {
			response: { headers: headers }
		}
		errorResponse.response.headers['set-cookie'].push(sessionCookie);
		errorResponse.statusCode = 302
		thenFunc = function() {return this};
		catchFunc = function(errorCallback) {errorCallback(errorResponse)}
	}
	else {
		var fakeResponse = { headers: headers };
		fakeResponse.statusCode = 200;
		thenFunc = function(resultCallback) {resultCallback(fakeResponse); return this;}
		catchFunc = function(err) {}
	}

	return {
		session: sessionCookie,
		fakeCookie: fakeCookie,
		response: {
			then: thenFunc,
			catch: catchFunc
		}
	}
}
