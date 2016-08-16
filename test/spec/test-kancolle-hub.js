'use strict';

const hub = require('../../src/kancolle/hub');
const servers = require('../../src/kancolle/server/');

describe('Kancolle hub', function() {

	it('request an existing server should return an expected server', function() {
		const BOUNDARY = [1,20];
		for(var n = BOUNDARY[0]; n <= BOUNDARY[1]; ++n) {
			var accessPropertyName = 'World_' + n;
			assert.isTrue(servers.hasOwnProperty(accessPropertyName), accessPropertyName + ' not found');
			assert.deepEqual(hub.getServer(n), servers[accessPropertyName], n + ' should be the same server');
		}
	})

	it('request non-existent server should throw ReferenceError', function() {
		const invalidValue = -1;
		assert.throws(function() {
			hub.getServer(invalidValue);
		}, ReferenceError, null, 'should throw misconfiguration error');
	})

})