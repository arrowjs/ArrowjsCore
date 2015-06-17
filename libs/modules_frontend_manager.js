'use strict';

let config = require('../config/config');
let redis = require('redis').createClient();
let path = require('path');
let modules = {};

module.exports = function () {
    return modules;
};

module.exports.loadAllModules = function () {
    // Globbing admin module files
    let module_tmp = {};
    config.getGlobbedFiles(__base + 'app/frontend/*/module.js').forEach(function (routePath) {
        console.log(path.resolve(routePath));
        require(path.resolve(routePath))(module_tmp);
    });

    // Add new module
    for (let i in module_tmp) {
        if (__modules[i] == undefined) {
            __modules[i] = module_tmp[i];
        }
        else {
            _.assign(module_tmp[i], __modules[i]);
            __modules[i] = module_tmp[i];
        }
    }

    // Remove module
    for (let i in __modules) {
        if (module_tmp[i] == undefined) {
            delete __modules[i];
        }
    }
    redis.set('all_f_modules', JSON.stringify(__f_modules), redis.print);
};

