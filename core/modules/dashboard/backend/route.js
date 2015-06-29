'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');

router.route('/').get(controller.index);

module.exports = router;
