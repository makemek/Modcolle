'use strict';

const nock = require('nock');
const sprintf = require('sprintf-js').sprintf;

const HOST = 'https://www.dmm.com';
const TOKEN = {
	form: '0123456789abcdef0000000000000000',
	dmm: '0123456789abcdef1111111111111111',
	data: '0123456789abcdef2222222222222222',

	auth: {
		token: '0123456789abcdef3333333333333333',
		login_id: '0123456789abcdef4444444444444444',
		password: '0123456789abcdef5555555555555555',
	}
}

nock(HOST)
.get('/my/-/login/=/path=Sg__/')
.reply(200, function() {
	var htmlForm = sprintf('<input type="hidden" name="token" value="%s" id="id_token">', TOKEN.form);
	var ajaxDmmToken = sprintf('xhr.setRequestHeader("DMM_TOKEN", "%s");', TOKEN.dmm);
	var ajaxDataToken = sprintf('"token": "%s"', TOKEN.data);

	return htmlForm + ajaxDmmToken + ajaxDataToken;
})

nock(HOST, {
	reqheaders: {
		'DMM_TOKEN': TOKEN.dmm,
		'x-requested-with': 'XMLHttpRequest'
	}
})
.post('/my/-/login/ajax-get-token/', {token: TOKEN.data})
.reply(200, TOKEN.auth)

module.exports = exports = {token: TOKEN};
