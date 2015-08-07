'use strict';

let md = require('../libs/modules_manager');
let _ = require('lodash');

module.exports = function (req, res, next) {
    __cache.get(__config.redis_prefix + 'all_modules').then(function (results) {
        if (results != null) {
            global.__modules = JSON.parse(results);
        } else {
            md.loadAllModules();
            md.makeMenu(__modules);
        }

        __cache.get(__config.redis_prefix + 'backend_menus')
            .then(function (menus) {
                if (menus != null) global.__menus = JSON.parse(menus);
                else console.log('Backend menus is not defined!!!');
            }).catch(function (err) {
                console.log('***********', err.stack);
            });

        __cache.get(__config.redis_prefix + __config.key).then(function (config) {
            if (config != null) {
                let data = JSON.parse(config);
                delete data.regExp;
                global.__config = _.assign(global.__config, data);
            } else {
                global.__config = require('../libs/config_manager.js');
            }
        }).catch(function (err) {
            console.log('***********', err.stack);
        });

    });
    next();
};
