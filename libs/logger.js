"use strict";
const winston = require('winston'),
    fs = require('fs');

let logDir = 'log', // Or read from a configuration
    env = process.env.NODE_ENV || 'development';

if (!fs.existsSync(logDir)) {
    // Create the directory if it does not exist
    fs.mkdirSync(logDir);
}
const logger = new ( winston.Logger )({
    transports: [
        new winston.transports.Console({
            prettyPrint: true,
            colorize: true,
            silent: false,
            timestamp: false
        }),
        new winston.transports.File({
            level: env === 'development' ? 'debug' : 'info',
            filename: logDir + '/logs.log',
            maxsize: 1024 * 1024 * 10 // 10MB
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: 'log/exceptions.log'
        }),
        new winston.transports.Console({
            //prettyPrint: true,
            level: "error",
            colorize: true,
            silent: false,
            timestamp: false
        })
    ]
});

module.exports = logger;