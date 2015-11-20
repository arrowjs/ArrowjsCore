'use strict';
const Arrow = require('"../../..');

const application = new Arrow();
application.setConfig("port","3333");
application.start();