'use strict';

/**
 * Module dependencies.
 */
let _ = require('lodash'),
    glob = require('glob'),
    chalk = require('chalk');

function init() {
    /**
     * Before we begin, lets set the environment variable
     * We'll Look for a valid NODE_ENV variable and if one cannot be found load the development NODE_ENV
     */
    glob(__base + 'config/env/' + process.env.NODE_ENV + '.js', {
        sync: true
    }, function(err, environmentFiles) {
        if (!environmentFiles.length) {
            if (process.env.NODE_ENV) {
                console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
            } else {
                console.error(chalk.red('NODE_ENV is not defined! Using default product environment'));
            }
            process.env.NODE_ENV = 'development';
        } else {
            console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
        }
    });

};

init();
/**
 * Load app configurations
 */
module.exports = _.extend(
    require(__base + 'config/env/all.js'),
    require(__base + 'config/env/' + process.env.NODE_ENV) || {}
);
