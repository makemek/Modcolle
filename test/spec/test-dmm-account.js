'use strict';

const DmmAccount = require('../../scripts/model/dmmAccount');
const sinon = require('sinon');
const rp = require('request-promise');
const sprintf = require("sprintf-js").sprintf

describe('DMM account', function() {

	it('empty email', sinon.test(function() {
		var account = new DmmAccount('', '1234');
		expectError(account);
	}))

	it('empty password', sinon.test(function() {
		var account = new DmmAccount('john@example.com', '');
		expectError(account);
	}))

	it.only('login fail due to incorrect email or password', sinon.test(function() {
		var account = new DmmAccount('john@example.com', '1234');

		var loginToken = srapeLoginPageTokenMock();
		this.stub(rp, 'get').onFirstCall().returns(loginToken.response);

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

function srapeLoginPageTokenMock() {
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
				var body = new String(getFakeHtml());
				var spy = sinon.spy(body, 'match');
				htmlBodyCallback(body);
				
				var returnVal = spy.firstCall.returnValue;
				assert.include(returnVal, fakeToken.dmmToken);
				assert.include(returnVal, fakeToken.dataToken);

				spy.restore();
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

function ajaxAuthorizeDmmTokenMock() {
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
