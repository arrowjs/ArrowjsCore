'use strict';

let express = require('express');
let router = express.Router();
let moduleName = 'log';

let log = require('./controllers/log.js');

router.get('/log', __acl.isAllow(moduleName, 'index'), log.list);
router.delete('/log', __acl.isAllow(moduleName, 'delete'), log.delete);
router.get('/log/page/:page', __acl.isAllow(moduleName, 'index'), log.list);
router.get('/log/create', __acl.isAllow(moduleName, 'create'), log.create);
router.post('/log/create', __acl.isAllow(moduleName, 'create'), log.save);
router.get('/log/:id', __acl.isAllow(moduleName, 'update'), log.view);
router.post('/log/:id', __acl.isAllow(moduleName, 'update'), log.update);

module.exports = router;
