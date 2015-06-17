'use strict';
 /**
 * Created by vhchung on 1/26/15.
 */
let express = require('express');
let router = express.Router();
let moduleName = 'logs';

let logs = require('./controllers/logs.js');

router.get('/logs', __acl.isAllow(moduleName, 'index'), logs.list);
router.delete('/logs', __acl.isAllow(moduleName, 'delete'), logs.delete);
router.get('/logs/page/:page', __acl.isAllow(moduleName, 'index'), logs.list);
router.get('/logs/create', __acl.isAllow(moduleName, 'create'), logs.create);
router.post('/logs/create', __acl.isAllow(moduleName, 'create'), logs.save);
router.get('/logs/:id', __acl.isAllow(moduleName, 'update'), logs.view);
router.post('/logs/:id', __acl.isAllow(moduleName, 'update'), logs.update);

module.exports = router;
