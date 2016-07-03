'use strict';

const DmmGame = require('../../scripts/model/dmmGame');
const Account = require('../../scripts/model/dmmAccount');
const sinon = require('sinon');
const async = require('async');
const request = require('request');

describe.only('DMM game abstract class', function() {

	var dmmGame, account;

	beforeEach(function() {
		account = new Account('poi@poi.com', 'poipoi');
		dmmGame = new DmmGame(account);
	})

	it('get expected gadget information', sinon.test(function() {
		var fakeCookie = 'a=1; b=2;';
		var fakeAppId = -1;
		var spyPreload = this.spy(dmmGame, '_preload');
		var stubCookie = this.stub(account, 'getCookie').returns(fakeCookie);
		var stubAppId = this.stub(dmmGame, '_getAppId').returns(fakeAppId);
		var procedure = this.stub(async, 'waterfall');

		dmmGame.start();

		var taskAppInfo = procedure.firstCall.args[0];
		var taskPreload = procedure.firstCall.args[1];

		assert.deepEqual(taskPreload, dmmGame._preload);
	}))

})
