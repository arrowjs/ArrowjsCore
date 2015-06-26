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
            console.log(results);
            if (results != null) {
                let arr_data = JSON.parse(results);
                let index = 0;

                let plugins = __config.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);
                for (let i in plugins) {
                    if (plugins.hasOwnProperty(i)) {
                        let plugin = require(plugins[i]);
                        _.assign(plugin, arr_data[index++]);
                        self.plugins.push(plugin);
                    }
                }
            } else {
                let plugins = __config.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);
                for (let i in plugins) {
                    if (plugins.hasOwnProperty(i)) {
                        let plugin = require(plugins[i]);
                        self.plugins.push(plugin);
                    }
                }

                redis.set(__config.redis_prefix + self.redis_key, JSON.stringify(self.plugins), redis.print);
            }


        });
    };

    self.reloadAllPlugins = function () {
        self.plugins = [];

        let plugins = __config.getOverrideCorePath(__base + 'core/plugins/*/*.js', __base + 'app/plugins/*/*.js', 2);

        //console.log(plugins);
        //console.log(require.cache['/Users/huydq/PhpstormProjects/crazyarrow/core/plugins/facebook/facebook-plugin.js']);
        //console.log(require('/Users/huydq/PhpstormProjects/crazyarrow/core/plugins/facebook/facebook-plugin.js'));

        for (let i in plugins) {
            if (plugins.hasOwnProperty(i)) {
                self.plugins.push(require(plugins[i]));
            }
        }

        //redis.set(__config.redis_prefix + self.redis_key, JSON.stringify(self.plugins), redis.print);
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
