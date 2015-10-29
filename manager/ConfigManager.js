"use strict";

let SystemManager = require('./SystemManager');
let __ = require('../libs/global_function');
let _ = require('lodash');

class ConfigManager extends SystemManager {
    constructor(app){
        super();
        this._config = app._config;
        this.pub = app.redisCache;
        this.sub = app.RedisCache();
        let self = this;
        this.sub.subscribe(self._config.redis_prefix + "config_update");

        this.sub.on("message", function (demo) {
            self.getConfig();
        })
    }

    getCache(){
        var self = this._config;
        return this.pub.getAsync(self.redis_prefix + self.key)
            .then(function (data) {
                if(data) {
                    let conf = JSON.parse(data);
                    if(self.raw_config || self.raw_config.length > 0) {
                        self.raw_config.map(function (key) {
                            if(conf[key]) {
                                delete conf[key];
                            }
                        })
                    }
                    _.assign(this._config,conf);
                }
            }.bind(this))
            .catch(function (err) {
                log("Config Manager Class: ",err);
                return err
            }.bind(this));
    }

    reload(){
        let self = this;
        this.getConfig.then(function () {
            self.pub.publish(self._config.redis_prefix + "config_update","Update config")
        })
    }
    setCache() {
        let self = this;
        return this.publisher.setAsync(self.redis_prefix + self.key,JSON.stringify(self._config))
    }
}

module.exports = ConfigManager;