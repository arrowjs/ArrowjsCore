'use strict';

/**
 * Module dependencies.
 */
//process.env.NODE_ENV = "production";
let Arrow = require('../..');

let application = new Arrow();

global.Arrow = application;


//application.before(require('./core_route'));
application.config();

application.listen(3333, function () {
    console.log('Application started on port ' + 3333, ', Process ID: ' + process.pid);
});

module.exports = application;