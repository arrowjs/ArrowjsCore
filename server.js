'use strict';

/**
 * Module dependencies.
 */
let debug = require('debug')('ArrowJs');
let fs = require('fs');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
global.__base = __dirname + '/';
global.__config = require(__base + 'core/libs/config_manager.js');
global.__ = require(__base + 'core/libs/global_function');
global.__lang = require(__base + 'core/libs/i18n.js')();
global.__utils = require(__base + 'core/libs/utils');
global.__acl = require(__base + 'core/libs/acl');
global.__models = require(__base + 'core/libs/models_manager');
global.__pluginManager = require(__base + 'core/libs/plugins_manager');
global.__menus = require(__base + 'core/libs/menus_manager')();
global.__modules = require(__base + 'core/libs/modules_manager')();
global.__cache = require(__base + 'core/libs/arr_caching')();
global.__messages = [];
global.__setting_menu_module = [];
global.BackModule = require(__base + 'core/libs/BackModule');
global.FrontModule = require(__base + 'core/libs/FrontModule');

/** Init widgets */
require(__base + 'core/libs/widgets_manager')();

/** Init plugins */
__pluginManager.loadAllPlugins();

/** Create app dir if not exist */
__utils.createDirectory('app');
__utils.createDirectory('app/custom_filters');
__utils.createDirectory('app/modules');
__utils.createDirectory('app/plugins');
__utils.createDirectory('app/widgets');

/** Init the express application */
let app = require('./config/app')();

/** Bootstrap passport config */
require('./config/passport')();

/** Start the app by listening on <port> */
let server = app.listen(__config.port);

/** Expose app */
module.exports = app;

/** Logging initialization */
console.log('Application started on port ' + __config.port);

