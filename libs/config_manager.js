'use strict';

/**
 * Module dependencies.
 */
let _ = require('lodash'),
    glob = require('glob'),
    chalk = require('chalk'),
    path = require('path'),
    fsEx = require('fs-extra'),
    fs = require('fs')
let redis = require('redis').createClient();
let sub = require('redis').createClient();


sub.on("message", function (a) {
    getConfig();
});

sub.subscribe('configUpdate');

function init() {
    /**
     * Before we begin, lets set the environment variable
     * We'll Look for a valid NODE_ENV variable and if one cannot be found load the development NODE_ENV
     */
    var conf = {}
    console.log(process.env.NODE_ENV);
    if (!fs.existsSync(__base + 'config/env/all.js')) {
        fsEx.copySync(path.resolve(__dirname, '..', 'demo/all.js'), __base + 'config/env/all.js');
        _.assign(conf, require(__base + 'config/env/all.js'));
    } else {
        _.assign(conf, require(__base + 'config/env/all.js'));
    }

    if (fs.existsSync(__base + 'config/env/' + process.env.NODE_ENV + '.js')) {
        _.assign(conf, require(__base + 'config/env/' + process.env.NODE_ENV));
    } else {
        fsEx.copySync(path.resolve(__dirname, '..', 'demo/development.js'), __base + 'config/env/' + process.env.NODE_ENV + '.js');
        _.assign(conf, require(__base + 'config/env/' + process.env.NODE_ENV));
    }

    //glob(__base + 'config/env/' + process.env.NODE_ENV + '.js', {
    //    sync: true
    //}, function (err, environmentFiles) {
    //    if (!environmentFiles.length) {
    //        if (process.env.NODE_ENV) {
    //            console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
    //        } else {
    //            console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
    //        }
    //    }
    //});

    return conf
}


/**
 * Load app configurations
 */

module.exports  = getConfig;

function getConfig() {
    global.__config = init();
    return new Promise(function (fulfill, reject) {
        redis.del(__config.redis_prefix + __config.key, function (err,reply) {
            console.log(err,reply);
            redis.get(__config.redis_prefix + __config.key, function (err, config) {
                if (err) reject(err);
                if (config) {
                    let data = JSON.parse(config);
                    delete data.regExp;
                    _.assign(global.__config, data);
                    fulfill(global.__config);
                } else {
                    fulfill(global.__config);
                }
            })
        })
    })
}

module.exports.reloadConfig =  reloadConfig;

function reloadConfig() {
    return new Promise(function (fulfill, reject) {
        redis.get(__config.redis_prefix + __config.key, function (err, config) {
            if (err) reject(err);
            if (config) {
                let data = JSON.parse(config);
                delete data.regExp;
                _.assign(global.__config, data);
            }
            fulfill(global.__config);
            redis.publish('configUpdate','I update');
        })
    })
};

