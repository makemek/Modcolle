'use strict'

const express = require('express')
const router = express.Router()

router.use('/', require('./game'))
router.use('/kcs', require('./assets'))
router.use('/kcsapi', require('./kcsapi/'))

module.exports = router
