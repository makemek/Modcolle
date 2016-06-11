var express = require('express');
var router = express.Router();

var kancolleExternal = require('../../model/kancolleExternal');

router.post('/*', function(req, res) {
	res.redirect(307, kancolleExternal.api(req.url));
})

module.exports = exports = router;
