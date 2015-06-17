'use strict'
/**
 * Created by thanhnv on 2/23/15.
 */
let config = require('../config/config');
let redis = require('redis').createClient();
let path = require('path');
let _ = require('lodash');
let modules = {};
module.exports = function () {
    return modules;
};
module.exports.loadAllModules = function () {

    // Globbing admin module files
    let module_tmp = {};
    config.getGlobbedFiles(__base + 'app/backend/modules/*/module.js').forEach(function (routePath) {
        console.log(path.resolve(routePath));
        require(path.resolve(routePath))(module_tmp);
    });
    //add new module
    for (let i in module_tmp) {
        if (__modules[i] == undefined) {
            __modules[i] = module_tmp[i];
        }
        else {
            delete module_tmp[i].active;
            _.assign(__modules[i], module_tmp[i]);
        }
    }
    //remove module
    for (let i in __modules) {
        if (module_tmp[i] == undefined) {
            delete __modules[i];
        }
    }
    redis.set(config.redis_prefix +'all_modules', JSON.stringify(__modules), redis.print);
}
