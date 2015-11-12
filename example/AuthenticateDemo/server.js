'use strict';

/**
 * Module dependencies.
 */
//process.env.NODE_ENV = "production";
let Arrow = require('../..');

let application = new Arrow();

application.start({
    passport :true
});

