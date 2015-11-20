"use strict";

const SystemManager = require('./SystemManager'),
    __ = require('../libs/global_function'),
    _ = require('lodash');
/**
 * Generic default manager
 */
class DefaultManager extends SystemManager {
    constructor(app, name) {
        super(app, name);
    }
}

module.exports = DefaultManager;