'use strict';

let express = require('express'),
    router = express.Router(),
    category = require('./controllers/category'),
    post = require('./controllers/post'),
    page = require('./controllers/page');

let moduleName = 'blog';

router.route('/blog').get(__acl.isAllow(moduleName, 'post_index'), post.list);

router.route('/blog/category').get(__acl.isAllow(moduleName, 'category_index'), category.listAll)
    .delete(__acl.isAllow(moduleName, 'category_delete'), category.delete);
router.route('/blog/category/page/:page').get(__acl.isAllow(moduleName, 'category_index'), category.list);
router.route('/blog/category/create').post(__acl.isAllow(moduleName, 'category_create'), category.save);
router.route('/blog/category/:catId').put(__acl.isAllow(moduleName, 'category_edit'), category.update);

router.get('/blog/post/page/:page', __acl.isAllow(moduleName, 'post_index'), post.list);
router.route('/blog/post/page/:page/sort/:sort/(:order)?').get(__acl.isAllow(moduleName, 'post_index'), post.list);
router.route('/blog/post').get(__acl.isAllow(moduleName, 'post_index'), post.list)
    .delete(__acl.isAllow(moduleName, 'post_delete'), post.delete);
router.get('/blog/post/create', __acl.isAllow(moduleName, 'post_create'), post.create);
router.post('/blog/post/create', __acl.isAllow(moduleName, 'post_create'), post.save);
router.get('/blog/post/:cid', __acl.isAllow(moduleName, 'post_edit'), post.view);
router.post('/blog/post/:cid', __acl.isAllow(moduleName, 'post_edit_all', 'post_edit', post.hasAuthorization), post.update, post.view);
router.param('cid', post.read);

router.get('/blog/page', __acl.isAllow(moduleName, 'page_index'), page.list);
router.get('/blog/page/page/:page', __acl.isAllow(moduleName, 'page_index'), page.list);
router.route('/blog/page/page/:page/sort/:sort/(:order)?').get(__acl.isAllow(moduleName, 'page_index'), page.list);
router.delete('/blog/page', __acl.isAllow(moduleName, 'page_delete'), page.delete);
router.get('/blog/page/create', __acl.isAllow(moduleName, 'page_create'), page.create);
router.post('/blog/page/create', __acl.isAllow(moduleName, 'page_create'), page.save);
router.get('/blog/page/:cid([0-9]+)', __acl.isAllow(moduleName, 'page_edit'), page.view);
router.post('/blog/page/:cid([0-9]+)', __acl.isAllow(moduleName, 'page_edit'), page.update, page.view);
router.get('/blog/page/:name', __acl.isAllow(moduleName, 'page_edit'), page.redirectToView);

module.exports = router;