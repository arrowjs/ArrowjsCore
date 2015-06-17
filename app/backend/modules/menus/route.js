'use strict'
/**
 * Created by thanhnv on 2/17/15.
 */

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');

//Menus Routes
let moduleName = 'menus';

router.route('/menus').get(__acl.isAllow(moduleName, 'index'), controller.index);
router.get('/menus/sort/:sort/:order', __acl.isAllow(moduleName, 'index'), controller.index);
router.route('/menus').delete(__acl.isAllow(moduleName, 'delete'),controller.delete);
router.route('/menus/create').get(__acl.isAllow(moduleName, 'create'), controller.create);
router.route('/menus/create').post(__acl.isAllow(moduleName, 'create'), controller.save);
router.route('/menus/update/:cid').get(__acl.isAllow(moduleName, 'update'),controller.read);
router.route('/menus/update/:cid').post(__acl.isAllow(moduleName, 'update'), controller.update);

router.param('cid', controller.menuById);
module.exports = router;
