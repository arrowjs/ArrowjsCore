"use strict";

let SystemManager = require('./../manager/SystemManager');
let __ = require('./../libs/global_function');

class BackendMenuManager extends SystemManager {
    constructor(app){
        super(app);
        this._config = app._config;
        this._modules = app.modules;
        this.pub = app.redisCache;
        this.sub = app.RedisCache();
        let menus = {};
        // Main Navigation group
        menus.default = {
            title: 'Main Navigation',
            sort: 1,
            modules: {}
        };

        // System group
        menus.systems = {
            title: 'Systems',
            sort: 2,
            modules: {}
        };

        // Sorting menu
        menus.sorting = {};
        menus.sorting.default = [];
        menus.sorting.systems = [];
        this._menus = menus;
    }

    getCache(){
        var self = this._config;
        return this.pub.getAsync(self.redis_prefix + self.redis_key.backend_menus)
            .then(function (data) {
                if(data) {
                    let menu = JSON.parse(data);
                    _.assign(this._menus,menu);
                }
            }.bind(this))
            .catch(function (err) {
                log("Backend Menu Manager Class: ",err);
                return err
            }.bind(this));
    }

    setCache(){
        let self = this;
        return this.pub.setAsync(self._config.redis_prefix + self._config.redis_key.backend_menus, JSON.stringify(self._menus))
    }

    makeMenu(){
        let self = this;
        Object.keys(self._modules).map(function (mName) {
            if(self._modules[mName].hasOwnProperty('backend_menu')){
                if (!self._modules[mName].system && self._modules[mName].active) {
                    if (!self._menus.default.modules.hasOwnProperty(mName)) {
                        self._menus.sorting.default.push(mName);
                        self._menus.default.modules[mName] = self._modules[mName].backend_menu;
                    }
                }

                if (self._modules[mName].system) {
                    if (!self._menus.systems.modules.hasOwnProperty(mName)) {
                        self._menus.sorting.systems.push(mName);
                        self._menus.systems.modules[mName] = self._modules[mName].backend_menu;
                    }
                }
            }
        })
        this._menus = self._menus;
    }
}

module.exports = BackendMenuManager;