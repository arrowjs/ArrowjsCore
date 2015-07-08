'use strict';

let redis = require('redis').createClient();
let path = require('path');
let _ = require('lodash');
let modules = {};

module.exports = function () {
    return modules;
};

module.exports.loadAllModules = function () {

    let menuManager = require(__dirname + '/menus_manager');
    let module_tmp = {};
    // Load modules
    let moduleList =__.getOverrideCorePath(__base + 'core/modules/*/module.js', __base + 'app/modules/*/module.js', 2);

    for (let index in moduleList) {
        if (moduleList.hasOwnProperty(index)) {
            if (moduleList[index].indexOf(__base + 'core/modules') > -1) {
                // System modules
                require(moduleList[index])(module_tmp)[index].system = true;
            } else {
                // App modules
                require(moduleList[index])(module_tmp)[index].system = false;
            }
        }
    }

    // Add new module
    for (let i in module_tmp) {
        if (__modules[i] == undefined) {
            __modules[i] = module_tmp[i];
            menuManager.addMenu(i);
        } else {
            delete module_tmp[i].active;
            _.assign(__modules[i], module_tmp[i]);
            menuManager.modifyMenu(i);
        }
    }

    // Remove module
    for (let i in __modules) {
        if (module_tmp[i] == undefined) {
            menuManager.removeMenu(i);
            delete __modules[i];
        }
    }

    redis.set(__config.redis_prefix + 'all_modules', JSON.stringify(__modules), redis.print);
    redis.set(__config.redis_prefix + 'backend_menus', JSON.stringify(__menus), redis.print);
};
