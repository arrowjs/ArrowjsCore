'use strict';
const Arrow = require('../..');

const application = new Arrow();
application._config.port = 9000;
application.start();

//module.exports = application;