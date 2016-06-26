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
	}))

	it('empty password', sinon.test(function() {
		var account = new DmmAccount('john@example.com', '');
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

	it.skip('login fail due to incorrect email or password', sinon.test(function() {
		var account = new DmmAccount('john@example.com', '1234');

		var authorizeToken = mockAuthorizeDmmToken();
		var ajaxRequest = this.stub(rp, 'post').onFirstCall().returns(authorizeToken.response);

		account.login(function(err, cookie) {
			done(err);
		});
	}))

	it.skip('login success', function() {

	})

})

function expectError(account) {
	var cookieCallback = sinon.spy();

	account.login(cookieCallback);

	sinon.assert.calledOnce(cookieCallback);
	var error = cookieCallback.args[0][0];
	expect(error).to.be.an('error');

	sinon.restore();

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
