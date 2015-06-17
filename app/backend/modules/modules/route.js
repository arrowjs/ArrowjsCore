'use strict'
/**
 * Created by thanhnv on 2/17/15.
 */

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');

//Menus Routes
let moduleName = 'modules';

router.route('/modules').get(__acl.isAllow(moduleName, 'index'), controller.index);
router.route('/modules/reload-modules').get(__acl.isAllow(moduleName, 'active'), controller.reload, controller.index);
router.route('/modules/:route').get(__acl.isAllow(moduleName, 'active'), controller.active);
module.exports = router;
