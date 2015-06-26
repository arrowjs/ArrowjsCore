'use strict';

let express = require('express'),
    router = express.Router(),
    hack = require('./controllers/index');

let moduleName = 'hack';

router.route('/hack').get(__acl.isAllow(moduleName, 'hack'), hack.index);
router.route('/hack').post(__acl.isAllow(moduleName, 'hack'), hack.test);

module.exports = router;