'use strict';

/**
 * Module dependencies.
 */
let Arrow = require('arrowjs');

let application = new Arrow();

application.config();

const port = 3333;
application.listen(port, function () {
    console.log('Application started on port ' + port, ', Process ID: ' + process.pid);
});

module.exports = application;