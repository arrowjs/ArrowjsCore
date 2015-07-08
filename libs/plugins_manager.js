'use strict';

var _ = require('lodash'),
    redis = require('redis').createClient(),
    Promise = require('bluebird');


function PluginManager() {
    let self = this;

    self.redis_key = 'all_plugins';
    self.plugins = [];

    self.loadAllPlugins = function () {
        redis.get(__config.redis_prefix + self.redis_key, function (err, results) {
            if (results != null) {
                let arr_data = JSON.parse(results);
                let index = 0;
                let plugins =__.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);
                for (let i in plugins) {
                    if (plugins.hasOwnProperty(i)) {
                        let plugin = require(plugins[i]);
                        // Assign options from Redis, other properties form file
                        let k = arr_data[index++];
                        if(k) {
                            _.assign(plugin.options, k.options);
                            _.assign(k, plugin);
                        }
                        self.plugins.push(plugin);
                    }
                }
            } else {
                let plugins =__.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);

                for (let i in plugins) {
                    if (plugins.hasOwnProperty(i)) {
                        let plugin = require(plugins[i]);
                        self.plugins.push(plugin);
                    }
                }
            }

            redis.set(__config.redis_prefix + self.redis_key, JSON.stringify(self.plugins), redis.print);
        });
    };

    self.reloadAllPlugins = function () {
        self.plugins = [];

        let plugins =__.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);

        for (let i in plugins) {
            if (plugins.hasOwnProperty(i)) {
                self.plugins.push(require(plugins[i]));
            }
        }

        redis.set(__config.redis_prefix + self.redis_key, JSON.stringify(self.plugins), redis.print);
    };

    self.getPlugin = function (alias) {
        for (let i in self.plugins) {
            if (self.plugins.hasOwnProperty(i) && self.plugins[i].alias == alias) {
                return self.plugins[i];
            }
        }
    };
}

module.exports = new PluginManager();
