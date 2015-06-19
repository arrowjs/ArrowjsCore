'use strict';
/**
 * Created by thanhnv on 1/26/15.
 */
let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');
let moduleName = 'users';

//console.log(controller);

router.get('/users/signout', controller.signout);
router.get('/users/change-pass', __acl.isAllow(moduleName, 'update_profile'), controller.changePass);
router.post('/users/change-pass', __acl.isAllow(moduleName, 'update_profile'), controller.updatePass);
router.get('/users/profile/:cid',  __acl.isAllow(moduleName, 'update_profile'), controller.profile);
router.post('/users/profile/:cid', __acl.isAllow(moduleName, 'update', 'update_profile', controller.hasAuthorization), controller.update, controller.profile);

router.get('/users', __acl.isAllow(moduleName, 'index'), controller.list);
router.get('/users/page/:page', __acl.isAllow(moduleName, 'index'), controller.list);
router.get('/users/page/:page/sort/:sort/(:order)?', __acl.isAllow(moduleName, 'index'), controller.list);


router.delete('/users', __acl.isAllow(moduleName, 'delete'), controller.delete);
router.get('/users/create', __acl.isAllow(moduleName, 'create'), controller.create);
router.post('/users/create', __acl.isAllow(moduleName, 'create'), controller.save, controller.list);
router.get('/users/:cid', __acl.isAllow(moduleName, 'update'), controller.view);
router.post('/users/:cid', __acl.isAllow(moduleName, 'update'), controller.update, controller.list);

router.get('/users/course-view/:email', __acl.isAllow(moduleName, 'update'), controller.course_of);

router.param('cid', controller.userById);

module.exports = router;
