'use strict';

const nock = require('nock');

const dmmId = {
	newPlayer: 1,
	oldPlayer: 2
}

nock('http://203.104.209.7')
.get(function(uri) {
	var newPlayer = '/kcsapi/api_world/get_id/' + dmmId.newPlayer + '/1';
	return uri.startsWith(newPlayer);
})
.reply(200, 'svdata={"api_result": 1, "api_data": {"api_world_id": 0}}');

nock('http://203.104.209.7')
.persist()
.get(function(uri) {
  return /\/kcsapi\/api_world\/get_id\/\d+\/1/.test(uri);
})
.reply(200, 'svdata={"api_result": 1, "api_data": {"api_world_id": 1}}');

nock('http://osapi.dmm.com:80', {"encodedQueryParams":true})
.persist()
  .post('/gadgets/makeRequest', /url=http%3A%2F%2F\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}%2Fkcsapi%2Fapi_auth_member%2Fdmmlogin%2F\d+%2F1%2F\d+&st=.*&authz=signed&signOwner=true/)
  .reply(200, "throw 1; < don't be evil' >{\"http:\\/\\/0.0.0.0\\/kcsapi\\/api_auth_member\\/dmmlogin\\/12345678\\/1\\/1470910003205\":{\"rc\":200,\"body\":\"svdata={\\\"api_result\\\":1,\\\"api_result_msg\\\":\\\"成功\\\",\\\"api_token\\\":\\\"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\\\",\\\"api_starttime\\\":1470910011786}\",\"headers\":{\"Server\":\"nginx\",\"Content-Type\":\"text\\/plain\",\"Connection\":\"keep-alive\",\"X-Powered-By\":\"PHP\\/5.3.3\"}}}", { date: 'Thu, 11 Aug 2016 10:06:51 GMT',
  server: 'Apache',
  'cache-control': 'public; max-age=1209587',
  expires: 'Thu, 25 Aug 2016 10:06:38 GMT',
  'content-disposition': 'attachment;filename=p.txt',
  'content-length': '397',
  connection: 'close',
  'content-type': 'application/json; charset="UTF-8"' });


module.exports = exports = dmmId;