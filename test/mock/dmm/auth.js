'use strict';

const nock = require('nock');
const sprintf = require('sprintf-js').sprintf;

const HOST = 'https://www.dmm.com';
const TOKEN = {
	form: '0123456789abcdef0000000000000000',
	dmm: '0123456789abcdef1111111111111111',
	data: '0123456789abcdef2222222222222222',
}

nock(HOST)
.get('/my/-/login/=/path=Sg__/')
.reply(200, function() {
	var htmlForm = sprintf('<input type="hidden" name="token" value="%s" id="id_token">', TOKEN.form);
	var ajaxDmmToken = sprintf('xhr.setRequestHeader("DMM_TOKEN", "%s");', TOKEN.dmm);
	var ajaxDataToken = sprintf('"token": "%s"', TOKEN.data);

	return htmlForm + ajaxDmmToken + ajaxDataToken;
})

module.exports = exports = {token: TOKEN};
