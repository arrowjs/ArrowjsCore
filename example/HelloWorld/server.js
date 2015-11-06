'use strict';

/**
 * Module dependencies.
 */
let Arrow = require('../..');

let application = new Arrow();

global.Arrow = application;

const port = 8000;
application.listen(port, function () {
    console.log('Application started on port ' + port, ', Process ID: ' + process.pid);
});

module.exports = application;