'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');

let moduleName = 'modules';

router.route('/modules').get(__acl.isAllow(moduleName, 'index'), controller.index);
router.route('/modules/reload-modules').get(__acl.isAllow(moduleName, 'active'), controller.reload);
router.route('/modules/import-modules').post(__acl.isAllow(moduleName, 'import'), controller.importModule);
router.route('/modules/check-security/:alias').get(__acl.isAllow(moduleName, 'active'), controller.checkSecurity);
router.route('/modules/:alias').get(__acl.isAllow(moduleName, 'active'), controller.active);

module.exports = router;
