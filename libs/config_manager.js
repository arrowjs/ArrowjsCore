'use strict';

/**
 * Module dependencies.
 */
let _ = require('lodash'),
    glob = require('glob'),
    chalk = require('chalk'),
    path = require('path'),
    fsEx = require('fs-extra'),
    fs = require('fs'),
    conf = {};
let redis = require('redis').createClient();


function init() {
    /**
     * Before we begin, lets set the environment variable
     * We'll Look for a valid NODE_ENV variable and if one cannot be found load the development NODE_ENV
     */
    glob(__base + 'config/env/' + process.env.NODE_ENV + '.js', {
        sync: true
    }, function (err, environmentFiles) {
        if (!environmentFiles.length) {
            if (process.env.NODE_ENV) {
                console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
            } else {
                console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
            }
            process.env.NODE_ENV = 'development';
        } else {
            console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
        }
    });

    if (!fs.existsSync(__base + 'config/env/all.js')) {
        fsEx.copySync(path.resolve(__dirname, '..', 'demo/all.js'), __base + 'config/env/all.js');
        _.assign(conf, require(__base + 'config/env/all.js'));
    } else {
        _.assign(conf, require(__base + 'config/env/all.js'));
    }

    if (fs.existsSync(__base + 'config/env/' + process.env.NODE_ENV + '.js')) {
        _.assign(conf, require(__base + 'config/env/' + process.env.NODE_ENV));

    } else {
        _.assign(conf, require(__base + 'config/env/' + process.env.NODE_ENV));
    }

    redis.get('config.app', function (err, con) {
        if (con != null) {
            let userConfig = JSON.parse(con);
            _.assign(conf.app, userConfig);
        }
    });
}

init();
/**
 * Load app configurations
 */

module.exports = conf;