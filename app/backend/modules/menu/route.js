'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');

let moduleName = 'menu';

router.route('/menu').get(__acl.isAllow(moduleName, 'index'), controller.index);
router.get('/menu/sort/:sort/:order', __acl.isAllow(moduleName, 'index'), controller.index);
router.route('/menu').delete(__acl.isAllow(moduleName, 'delete'),controller.delete);
router.route('/menu/create').get(__acl.isAllow(moduleName, 'create'), controller.create);
router.route('/menu/create').post(__acl.isAllow(moduleName, 'create'), controller.save);
router.route('/menu/update/:cid').get(__acl.isAllow(moduleName, 'update'),controller.read);
router.route('/menu/update/:cid').post(__acl.isAllow(moduleName, 'update'), controller.update);
router.param('cid', controller.menuById);

module.exports = router;
