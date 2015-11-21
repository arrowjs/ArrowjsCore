'use strict';
const Arrow = require('arrowjs');
const arrowZmq = require('arrow-zeromq');

const application = new Arrow();
application.setConfig("port","5555");
application.addPlugin(arrowZmq());
application.start();