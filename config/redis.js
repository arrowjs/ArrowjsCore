"use strict";

module.exports = {
    redis_prefix: 'arrowjs_',
    redis_key : {
        configs : "site_setting",
        modules : "all_modules",
        backend_menus : "backend_menus",
        plugins : "all_plugins"
    },
    redis_event : {
        update_config : "config_update",
        update_module : "module_update"
    }
};