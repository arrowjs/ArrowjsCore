"use strict";

let SystemManager = require('./SystemManager');
let __ = require('./global_function');
let _ = require('lodash');

class ConfigManager extends SystemManager {
    constructor(app){
        super();
        this._config = app._config;
        this.publisher = app.redisCache;
        this.subscriber = app.RedisCache();

        let self = this;
        this.subscriber.subscribe(self._config.redis_prefix + "config_update");

        this.subscriber.on("message", function (demo) {
            self.getConfig();
        })
    }
    getConfig(){
        var self = this._config;
        this.publisher.getAsync(self.redis_prefix + self.key)
            .then(function (data) {
                let conf = JSON.parse(data);
                if(self.raw_config || self.raw_config.length > 0) {
                    self.raw_config.map(function (key) {
                        if(conf[key]) {
                            delete conf[key];
                        }
                    })
                }
                _.assign(this._config,conf);
            }.bind(this))
            .catch(function (err) {
                console.log("Config Manager Class: ",err);
                return err
            })
    }
    reloadConfig(){
        var self = this._config;
        this.publisher.getAsync(self.redis_prefix + self.key)
            .then(function (data) {
                let conf = JSON.parse(data);
                if(self.raw_config || self.raw_config.length > 0) {
                    self.raw_config.map(function (key) {
                        if(conf[key]) {
                            delete conf[key];
                        }
                    })
                }
                _.assign(this._config,conf);
                this.publisher.publish(self.redis_prefix + "config_update","Update config")
            }.bind(this))
            .catch(function (err) {
                console.log("Config Manager Class: ",err);
                return err
            })
    }
}

module.exports = ConfigManager;