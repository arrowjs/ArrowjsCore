/**
 * Created by vhchung on 6/24/15.
 */
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
            })
            .catch(function (err) {
                console.log('***********', err.stack);
            });
        __cache.get(__config.redis_prefix + __config.key).then(function (config) {
            if(config != null){
                var data = JSON.parse(config);
                delete data.regExr;
                //console.log("\x1b[31m\x1b[47m", data, "\x1b[0m");
                global.__config = _.assign(global.__config, data);
                //console.log("\x1b[31m\x1b[47m LOG", global.__config, "\x1b[0m");
            }
            else {
                global.__config = require('../libs/config_manager.js');
                console.log("dsfs");
            }
        }).catch(function (err) {
            console.log('***********', err.stack);
        });

    });
    next();
};
