"use strict";

let SystemManager = require('./../manager/SystemManager');
let __ = require('../libs/global_function');
let _ = require('lodash');


class PluginManager extends SystemManager {
    constructor(app) {
        super(app);
        this._config = app._config;
        this.pub = app.redisCache;

        let plugins = [];
        let pluginList = __.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);

        for (let i in pluginList) {
            if (pluginList.hasOwnProperty(i)) {
                let plugin = require(pluginList[i]);
                plugins.push(plugin);
            }
        }

        this._plugins = plugins
    }

    getCache() {
        let self = this._config;
        return this.pub.getAsync(self.redis_prefix + self.redis_key.plugins)
            .then(function (data) {
                if (data) {
                    this._plugins = [];
                    let arr_data = JSON.parse(data);
                    let index = 0;
                    let pluginList = __.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);
                    for (let i in pluginList) {
                        if (pluginList.hasOwnProperty(i)) {
                            let plugin = require(pluginList[i]);
                            // Assign options from Redis, other properties form file
                            let k = arr_data[index++];
                            if (k) {
                                _.assign(plugin.options, k.options);
                                _.assign(k, plugin);
                            }
                           this._plugins.push(plugin);
                        }
                    }
                }
                return this._plugins
            }.bind(this))
            .catch(function (err) {
                log("Plugin Manager Class: ", err);
                return err
            }.bind(this));

    }

    setCache() {
        let self = this;
        return this.pub.setAsync(self.redis_prefix + self.redis_key.plugins, JSON.stringify(self._plugins))
    }

    reload() {
        let self = this;
        let pluginList =__.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);

        for (let i in pluginList) {
            if (pluginList.hasOwnProperty(i)) {
                self._plugins.push(require(pluginList[i]));
            }
        }
        this.setCache();
    }
}

module.exports = PluginManager;