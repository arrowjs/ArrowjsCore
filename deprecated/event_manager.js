'use strict';

let Promise = require('bluebird');
let pluginManager = require('./plugins_manager');

function EventManager() {
    this.fire_event = function (name, data, cb) {
        let promises = [];
        let promisesSync = [];
        let allPromise = [];
        let syncData;

        // Check plugin will run with event
        for (let i in pluginManager.plugins) {
            if (pluginManager.plugins.hasOwnProperty(i)) {
                let plugin = pluginManager.plugins[i];
                let active = plugin.active;

                if (active) {
                    if (plugin[name]) {
                        // Check plugin run with sync data
                        if (plugin.sync) {
                            promisesSync.push(plugin[name]);
                        }
                        else {
                            promises.push(plugin[name](data));
                        }

                    }
                }
            }
        }

        if (promisesSync.length > 0) {
            syncData = data;
            allPromise.push(new Promise(function (done, reject) {
                Promise.each(promisesSync, function (task) {
                    task(syncData).then(function (result) {
                        syncData = result;
                    });
                }).finally(function () {
                    done(syncData);
                });
            }));
        }

        if (promises.length > 0) {
            allPromise.push(Promise.settle(promises).then(function (results) {
                let values = [];
                let errors = [];
                results.forEach(function (result) {
                    if (result.isFulfilled()) {
                        values.push(result.value());
                    }
                    else {
                        errors.push(result.reason());
                    }
                });
                return values;
            }));
        }

        if (allPromise.length > 0) {
            Promise.all(allPromise).then(function (results) {
                cb(null, results.join(''));
            });
        } else {
            cb(null, '');
        }
    };
}

module.exports = new EventManager();
