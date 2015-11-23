"use strict";
const winston = require('winston'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs');
/**
 * Setting logger
 */
let logger = {};

module.exports = logger;

module.exports.init = function (app) {
    let config = app._config;
    let logDir = config.logFolder || 'log/';

     // Or read from a configuration
    if (!fs.existsSync(path.normalize(app.arrFolder + logDir))) {
        // Create the directory if it does not exist
        fs.mkdirSync(path.normalize(app.arrFolder + logDir));
    }

    Object.keys(config.winstonLog).map(function (key) {
        if(_.isArray(config.winstonLog[key])) {
            config.winstonLog[key].map(function (k) {
                k.dirname = logDir
            })
        }
    });
    let log =  new ( winston.Logger )(config.winstonLog);
    _.assign(logger,log);

    return null;
};

