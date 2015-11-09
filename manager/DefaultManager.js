"use strict";

let SystemManager = require('./SystemManager');
let __ = require('../libs/global_function');
let _ = require('lodash');

class DefaultManager extends SystemManager {
    constructor(app,name){
        super(app,name);
    }
}

module.exports = DefaultManager;