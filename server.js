'use strict';

/**
 * Module dependencies.
 */
let debug = require('debug')('ArrowJs');
let init = require('./config/init')(),
    config = require('./config/config');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
global.__base = __dirname + '/';
global.__config = require('./config/config');
global.__ = require('./libs/global_function');
global.__modules = require('./libs/modules_backend_manager.js')();
global.__f_modules = require('./libs/modules_frontend_manager.js')();
global.__models = require('./libs/models_manager');
global.__acl = require('./libs/acl');
global.__menus = require('./app/menus/menus_manager')();
global.__setting_menu_module = [];
global.__widgets = require('./app/widgets/widgets_manager')();
global.__pluginManager = require('./libs/plugins_manager');
global.__messages = [];
global.__current_theme = {};
global.__cache = require('./libs/arr_caching')();
global.BaseModuleBackend = require('./app/backend/base_module');
global.BaseModuleFrontend = require('./app/frontend/base_module');
global.ArrModule = require('./libs/ArrModule');

__pluginManager.loadAllPlugins();

let redis = require('redis').createClient();

/** Init SEO */
redis.get(config.redis_prefix + 'seo_enable', function (err, result) {
    if (result != null) {
        global.__seo_enable = result;
    } else {
        redis.set(config.redis_prefix + 'seo_enable', true, function (err, res) {
            if (err) {
                console.log("Init app Redis reply error: " + err);
            } else {
                console.log("Init app Redis reply: " + res);
            }
        });
        global.__seo_enable = true;
    }
});

/** Init the express application */
let app = require('./config/app')();

/** Bootstrap passport config */
require('./config/passport')();

/** Start the app by listening on <port> */
let server = app.listen(config.port);

/** Expose app */
module.exports = app;

/** Logging initialization */
console.log('Application started on port ' + config.port);

