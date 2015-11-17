"use strict";

let SystemManager = require('./SystemManager');
let __ = require('../libs/global_function');
let _ = require('lodash');

class ConfigManager extends SystemManager {
    constructor(app,name){
        super(app,name);
    }

    getConfig (key){
        if(key) {
            return this._config[key];
        }
        return this._config
    };

    setConfig(key,setting){
        this._config[key] = setting;
        let self = this;
        return self.setCache().then(self.reload());
    };

    updateConfig(setting){
        console.log("*****",setting);

        let self = this;
        if(setting) {
            _.assign(this._config,setting);
            return self.setCache().then(self.reload());
        }
        return Promise.resolve();
    };

    getCache(){
        let self = this._config;
        return this.pub.getAsync(self.redis_prefix + self.redis_key.configs)
            .then(function (data) {
                if(data) {
                    let conf = JSON.parse(data);
                    //if(self.raw_config || self.raw_config.length > 0) {
                    //    self.raw_config.map(function (key) {
                    //        if(conf[key]) {
                    //            delete conf[key];
                    //        }
                    //    })
                    //}
                    _.assign(this._config,conf);
                }
                return(this._config);
            }.bind(this))
            .catch(function (err) {
                log("Config Manager Class: ",err);
                return err
            }.bind(this));
    }

    reload(){
        let self = this;
        return self.getCache().then(function () {
            return self.pub.publishAsync(self._config.redis_prefix + self._config.redis_event.update_config,"Update config")
        })
    }
    setCache() {
        let self = this._config;
        return this.pub.setAsync(self.redis_prefix + self.redis_key.configs,JSON.stringify(self))
    }
}

module.exports = ConfigManager;