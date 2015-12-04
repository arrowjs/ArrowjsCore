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
    /* istanbul ignore next */
    let logDir = config.logFolder || ('log' + path.sep);

     // Or read from a configuration
    !fs.existsSync(path.normalize(app.arrFolder + logDir)) && fs.mkdirSync(path.normalize(app.arrFolder + logDir));

    Object.keys(config.winstonLog).map(function (key) {
        _.isArray(config.winstonLog[key]) && (
            config.winstonLog[key].map(function (k) {
                k.dirname = path.normalize(app.arrFolder + logDir)
            })
        )
    });
    let log =  new ( winston.Logger )(config.winstonLog);
    _.assign(logger,log);

    return null;
};

