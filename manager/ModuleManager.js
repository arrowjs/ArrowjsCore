"use strict";

let SystemManager = require('./SystemManager');
let __ = require('./../libs/global_function');
let _ = require('lodash');

class ModuleManager extends SystemManager {
    constructor(app){
        super();
        this._config = app._config;
        this.publisher = app.redisCache;
        this.subscriber = app.RedisCache();

        let module_tmp = {};
        let moduleList = __.getOverrideCorePath(__base + 'core/modules/*/module.js', __base + 'app/modules/*/module.js', 2);
        Object.keys(moduleList).map(function (index) {
            let rModule = require(moduleList[index]);
            if(typeof rModule === "function") {
                if(moduleList[index].indexOf(__base + 'core/modules') > -1) {
                    if(typeof rModule === "function") {
                        let sysModule = rModule(module_tmp)[index];
                        sysModule.path = moduleList[index];
                        sysModule.system = true;
                        sysModule.active = true;
                    }
                } else {
                    let sysModule = rModule(module_tmp)[index];
                    sysModule.path = moduleList[index];
                    sysModule.system = true;
                    sysModule.active = true;
                }
            }
        });

        this._modules = module_tmp;
    }
    getModule() {
        var self = this._config;
        return this.publisher.getAsync(__config.redis_prefix + 'arrow_modules')
            .then(function (data) {
                let m = JSON.parse(data);
                _.assign(this._modules,m);
            }.bind(this))
            .catch(function (err) {
                this.log("Module Manager Class: ",err);
                return err
            }.bind(this))
    }
}

module.exports = ModuleManager;