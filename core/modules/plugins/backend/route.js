'use strict'
/**
 * Created by thanhnv on 2/17/15.
 */

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');

//Menus Routes
let moduleName = 'plugins';

router.route('/plugins').get(__acl.isAllow(moduleName, 'index'), controller.index);
router.route('/plugins/reload-modules').get(__acl.isAllow(moduleName, 'active'), controller.reload, controller.index);
router.route('/plugins/setting/:alias').get(__acl.isAllow(moduleName, 'index'), controller.setting);
router.route('/plugins/setting/:alias').post(__acl.isAllow(moduleName, 'index'), controller.save_setting, controller.setting);
router.route('/plugins/:alias').get(__acl.isAllow(moduleName, 'active'), controller.active, controller.index);
module.exports = router;
