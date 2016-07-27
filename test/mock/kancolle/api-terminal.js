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
	var oldPlayer = '/kcsapi/api_world/get_id/' + dmmId.oldPlayer + '/1';
	return uri.startsWith(oldPlayer);
})
.reply(200, 'svdata={"api_result": 1, "api_data": {"api_world_id": 1}}');

module.exports = exports = dmmId;