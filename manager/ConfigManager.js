"use strict";

const SystemManager = require('./SystemManager'),
    __ = require('../libs/global_function'),
    _ = require('lodash');
/**
 * class ConfigManager extends SystemManager
 */
class ConfigManager extends SystemManager {
    /**
     * Create ConfigManager object
     * @param app - ArrowApplication
     * @param name - key will be used in Redis to synchronize configuration among multiple ArrowApplication processes.
     */
    constructor(app, name) {
        super(app, name);
    }

    /**
     * Get system config by key
     * @param key
     * @returns {*}
     */
    getConfig(key) {
        if (_.isString(key)) {
            if (key.indexOf(".") > 0) {
                let arrayKey = key.split(".");
                let self = this._app._config;
                let result;
                arrayKey.map(function (name) {
                    if (self[name]) {
                        result = self[name];
                        self = result;
                    } else {
                        result = null
                    }
                });
                return result
            } else {
                return this._app._config[key];
            }
        } else {
            return this._app._config;
        }
    }

;
    /**
     * Set config
     * @param key
     * @param setting
     * @returns {*|Promise.<T>}
     */
    setConfig(key, setting) {
        this._app._config[key] = setting;
        let self = this;
        return self.setCache().then(self.reload());
    }

    /**
     * Set multi config
     * @param setting
     * @returns {*}
     */
    updateConfig(setting) {
        let self = this;
        _.assign(this._app._config, setting);
        return self.setCache().then(self.reload());
    }


    getCache() {
        let self = this._app._config;
        /* istanbul ignore next */
        return this.pub.getAsync(self.redis_prefix + self.redis_key.configs)
            .then(function (data) {
                if (data) {
                    let conf = JSON.parse(data);
                    delete conf.port;
                    delete conf.db;
                    delete conf.redis;
                    _.assign(this._app._config, conf);
                    return (this._app._config);
                } else {
                    return (this._app._config);
                }
            }.bind(this))
            .catch(function (err) {
                log("Config Manager Class: ", err);
                return err
            }.bind(this));
    }

    reload() {
        let self = this;
        return self.getCache().then(function () {
            return self.pub.publishAsync(self._app._config.redis_prefix + self._app._config.redis_event.update_config, "Update config")
        })
    }

    setCache() {
        let self = this._app._config;
        return this.pub.setAsync(self.redis_prefix + self.redis_key.configs, JSON.stringify(self))
    }
}

module.exports = ConfigManager;