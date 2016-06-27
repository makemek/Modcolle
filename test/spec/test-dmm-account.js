'use strict';

const DmmAccount = require('../../scripts/model/dmmAccount');
const sinon = require('sinon');
const rp = require('request-promise');
const sprintf = require("sprintf-js").sprintf
const async = require('async');

describe('DMM account', function() {

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

	it('scrape login token from DMM login page', sinon.test(function() {
		var procedure = this.stub(async, 'waterfall');
		
		var account = new DmmAccount('john@example.com', '1234');
		account.login();
		
		var task = procedure.firstCall.args[0][0];
		var loginToken = mockSrapeLoginPageToken();
		var httpRequest = this.stub(rp, 'get').returns(loginToken.response);

		var spyDone = this.spy();
		task(spyDone);
		assert.isTrue(spyDone.calledOnce);

		var returnVal = spyDone.firstCall.args;
		assert.isNull(returnVal[0]);
		assert.equal(returnVal[1], loginToken.fakeToken.dmmToken);
		assert.equal(returnVal[2], loginToken.fakeToken.dataToken);

		var httpParam = httpRequest.firstCall.args[0];
		assert.include(httpParam.uri, 'https://www.dmm.com/my/-/login');
	}))

	it('authroize token', sinon.test(function() {
		var procedure = this.stub(async, 'waterfall');
		
		var account = new DmmAccount('john@example.com', '1234');
		account.login();
		
		var task = procedure.firstCall.args[0][1];
		var authroizedToken = mockAuthorizeDmmToken();
		var httpRequest = this.stub(rp, 'post').returns(authroizedToken.response);

		var spyDone = this.spy();
		var fake_dmm_token = 'dmm_token', fake_data_token = 'data_token';
		task(fake_dmm_token, fake_data_token, spyDone);
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
		var procedure = this.stub(async, 'waterfall');
		
		var email = 'john@example.com', password = '1234';
		var account = new DmmAccount(email, password);
		account.login();
		
		var task = procedure.firstCall.args[0][2];
		var auth = mockAuthentication();
		var httpRequest = this.stub(rp, 'post').returns(auth.response);

		var spyDone = this.spy();
		var tokenJson = {
			token: 'a',
			login_id: 'b',
			password: 'c'
		}
		task(JSON.stringify(tokenJson), spyDone);
		assert.isTrue(spyDone.calledOnce);

		var returnVal = spyDone.firstCall.args;
		assert.isNull(returnVal[0], 'should have no errors (be null)');
		assert.equal(returnVal[2], auth.fakeCookie, 'cookie should match and not altered');

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
			assert.equal(httpParam.form.login_id, email, 'email should be put into form.login_id');
			assert.equal(httpParam.form.password, password, 'password should be put into form.password');

			assert.isTrue(httpParam.form.hasOwnProperty(tokenJson.login_id), 'should have property named from token.login_id');
			assert.equal(httpParam.form[tokenJson.login_id], email, 'should have the same value as email address');

			assert.isTrue(httpParam.form.hasOwnProperty(tokenJson.password), 'should have property named from token.password');
			assert.equal(httpParam.form[tokenJson.password], password, 'should have the same value as password');
		}	
	}))
})

function expectError(account) {
	var cookieCallback = sinon.spy();

	account.login(cookieCallback);

	sinon.assert.calledOnce(cookieCallback);
	var error = cookieCallback.args[0][0];
	expect(error).to.be.an('error');

	return error;
}

function mockSrapeLoginPageToken() {
	var fakeToken = {
		formToken: '0123456789abcdef0000000000000000',
		dmmToken: '0123456789abcdef1111111111111111',
		dataToken: '0123456789abcdef2222222222222222'
	}
	
	var data = {
		fakeToken: fakeToken,
		fakeHtml: getFakeHtml(),
		response: {
			then: function(htmlBodyCallback) {
				htmlBodyCallback(getFakeHtml());
				return this;
			},
			catch: function(error) {return this;}
		}
	}

	function getFakeHtml() {
		var htmlForm = sprintf('<input type="hidden" name="token" value="%s" id="id_token">', fakeToken.formToken);
		var ajaxDmmToken = sprintf('xhr.setRequestHeader("DMM_TOKEN", "%s");', fakeToken.dmmToken);
		var ajaxDataToken = sprintf('"token": "%s"', fakeToken.dataToken);

		return htmlForm + ajaxDmmToken + ajaxDataToken;
	}

	return data;
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
	'INT_SESID=blahblahblah',
	'ckcy=2',
	'check_done_login=1'
	];

	var fakeResponse = {};
	fakeResponse.headers = {};
	fakeResponse.headers['set-cookie'] = fakeCookie;
	
	var thenFunc, catchFunc;
	if(success) {
		fakeResponse.statusCode = 302;
		thenFunc = function() {return this};
		catchFunc = function(errorCallback) {errorCallback(fakeResponse)}
	}
	else {
		fakeResponse.statusCode = 200;
		thenFunc = function(resultCallback) {resultCallback(fakeResponse); return this;}
		catchFunc = function(err) {}
	}

	return {
		fakeCookie: fakeCookie,
		response: {
			then: thenFunc,
			catch: catchFunc
		}
	}
}
