"use strict";

let express = require('express');
let  _ = require('lodash');
let path = require('path');
/**
 * Support serve static resource
 */
module.exports = function serveStatic() {
    let app = this;
    let config = app._config;
    if (_.isArray(config.resource.path)) {
        config.resource.path.map(function (link) {
            app.use(express.static(path.resolve(app.arrFolder + link), config.resource.option));
        })
    } else {
        app.use(express.static(path.resolve(app.arrFolder + config.resource.path), config.resource.option));
    }
}