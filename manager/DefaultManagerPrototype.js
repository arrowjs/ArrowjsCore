"use strict";

let SystemManager = require('./SystemManagerPrototype');
let util = require('util');

function DefaultManager (app,name) {
    SystemManager.call(this,app,name);
}

util.inherits(DefaultManager,SystemManager);

module.exports = DefaultManager;