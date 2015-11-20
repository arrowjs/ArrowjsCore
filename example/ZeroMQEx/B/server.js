'use strict';
const Arrow = require('../../..');

const application = new Arrow();
application.setConfig("port","5555");
application.start();