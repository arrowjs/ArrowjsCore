"use strict";

let SystemManager = require('./SystemManager');
let __ = require('../libs/global_function');
let _ = require('lodash');

class ConfigManager extends SystemManager {
    constructor(app){
        super(app);
        this._config = app._config;
        this.pub = app.redisClient;
        this.sub = app.redisSubscriber;
        let self = this;
        this.sub.subscribe(self._config.redis_prefix + self._config.redis_event.update_config);

        this.sub.on("message", function (demo) {
            self.getCache();
        })
    }

    getConfig (key){
        return this._config[key];
    };

    setConfig(key,setting){
        this._config[key] = setting;
        let self = this;
        return self.setCache().then(self.reload());
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
        self.getCache().then(function () {
            self.pub.publish(self._config.redis_prefix + self._config.redis_event.update_config,"Update config")
        })
    }
    setCache() {
        let self = this._config;
        return this.pub.setAsync(self.redis_prefix + self.redis_key.configs,JSON.stringify(self))
    }
}

module.exports = ConfigManager;