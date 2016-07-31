'use strict';

const nock = require('nock');
const sprintf = require('sprintf-js').sprintf;

const HOST = 'http://osapi.dmm.com';
const SECURITY_TOKEN_PATTERN = /^[a-zA-Z0-9/=+]{220}$/;
const DONT_BE_EVIL = "throw 1; < don't be evil' >";

nock(HOST)
.post('/gadgets/makeRequest', {
	url: 'http://www.example.com',
	st: SECURITY_TOKEN_PATTERN,
	authz: 'signed',
	signOwner: 'true'
})
.reply(200, DONT_BE_EVIL + `{"http:\/\/www.example.com":{"rc":200,"body":"<!doctype html>\n<html>\n<head>\n    <title>Example Domain<\/title>\n\n    <meta charset=\"utf-8\" \/>\n    <meta http-equiv=\"Content-type\" content=\"text\/html; charset=utf-8\" \/>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" \/>\n    <style type=\"text\/css\">\n    body {\n        background-color: #f0f0f2;\n        margin: 0;\n        padding: 0;\n        font-family: \"Open Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n        \n    }\n    div {\n        width: 600px;\n        margin: 5em auto;\n        padding: 50px;\n        background-color: #fff;\n        border-radius: 1em;\n    }\n    a:link, a:visited {\n        color: #38488f;\n        text-decoration: none;\n    }\n    @media (max-width: 700px) {\n        body {\n            background-color: #fff;\n        }\n        div {\n            width: auto;\n            margin: 0 auto;\n            border-radius: 0;\n            padding: 1em;\n        }\n    }\n    <\/style>    \n<\/head>\n\n<body>\n<div>\n    <h1>Example Domain<\/h1>\n    <p>This domain is established to be used for illustrative examples in documents. You may use this\n    domain in examples without prior coordination or asking for permission.<\/p>\n    <p><a href=\"http:\/\/www.iana.org\/domains\/example\">More information...<\/a><\/p>\n<\/div>\n<\/body>\n<\/html>\n","headers":{"Content-Type":"text\/html","Server":"ECS (rhv\/818F)","X-Cache":"HIT","X-Ec-Custom-Error":"1"}}}`);

nock(HOST)
.post('/gadgets/makeRequest', {
	url: 'http://invlidUrl',
	st: SECURITY_TOKEN_PATTERN,
	authz: 'signed',
	signOwner: 'true'
})
.reply(200, DONT_BE_EVIL + `{"http:\/\/invlidUrl":{"rc":500,"body":"request error","headers":[]}}`);

nock(HOST)
.post('/gadgets/makeRequest', {
	st: '',
	authz: 'signed',
	signOwner: 'true'
})
.reply(500, '<html><body><h1>Internal server error</h1><p>INVALID_GADGET_TOKEN</p></body></html>');