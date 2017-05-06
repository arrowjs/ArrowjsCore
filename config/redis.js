"use strict";

/**
 * Setting redis;
 * @type {{redis_prefix: string, redis_key: {configs: string, features: string, backend_menus: string, plugins: string}, redis_event: {update_config: string, update_feature: string}}}
 */
module.exports = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || '6379',
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        type : process.env.REDIS || 'fakeredis'
    },
    redis_prefix: 'arrowjs_',
    redis_key : {
        configs : "site_setting",
        features : "all_features",
    },
    redis_event : {
        update_config : "config_update",
        update_feature : "feature_update"
    }
};