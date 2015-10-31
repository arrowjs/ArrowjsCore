'use strict';

/**
 * Module dependencies.
 */
let fs = require('fs'),
    arrowStack = require('./ArrStack'),
    path = require('path'),
    express = require('express'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    chalk = require('chalk'),
    mailer = require('nodemailer'), //Todo: We should move SMTP to external optional module.
    smtpPool = require('nodemailer-smtp-pool'),   //Todo: We should move SMTP to external optional module.
    RedisCache = require("./RedisCache"),
    SystemLog = require("./SystemLog"),
    utils = require("./utils"),
    __ = require("./global_function"),
    EventEmitter = require('events').EventEmitter,
    pluginManager = require('../deprecated/plugins_manager'),
    ServiceManager = require("../manager/ServiceManager"),
    ConfigManager = require("../manager/ConfigManager"),
    WidgetManager = require("../manager/WidgetManager"),
    ModelManager = require("../manager/ModelManager"),
    LanguageManager = require("../manager/LanguageManager"),
    ModuleManager = require("../manager/ModuleManager"),
    MenuManager = require("../manager/MenuManager"),
    PluginManager = require("../manager/PluginManager");


class ArrowApplication {
    constructor() {
        //if NODE_ENV does not exist, use development by default
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';


        let eventEmitter = new EventEmitter();
        this.modules = [];
        this.beforeFunction = [];
        this._expressApplication = express();

        //Move all functions of express to ArrowApplication
        //So we can call ArrowApplication.listen(port)
        let self = this._expressApplication;
        for (let func in self) {
            if (typeof self[func] == 'function') {
                this[func] = self[func].bind(self);
            } else {
                this[func] = self[func]
            }
        }

        let requester = arrowStack(2);  //Why arrowStack(2)?
        this.baseFolder = path.dirname(requester) + '/';


        global.__base = this.baseFolder;
        this._config = __.getRawConfig();

        this._expressApplication.baseFolder = this.baseFolder;
        this._expressApplication._appConfig = this._config;

        //TODO: Cuong Tran, will this better way to use Winston Log?
        //http://thottingal.in/blog/2014/04/06/winston-nodejs-logging/
        global.log = SystemLog;

        //Make redis cache
        let redisConfig = this._config.redis || {};
        this.RedisCache = RedisCache.bind(null, redisConfig);
        this.redisCache = RedisCache(redisConfig);

        this.serviceManager = new ServiceManager(this);
        this.serviceManager.eventHook(eventEmitter);
        this.services = this.serviceManager._services;

        this.configManager = new ConfigManager(this);
        this.configManager.eventHook(eventEmitter);
        this._config = this.configManager._config;

        global.__ = __;
        global.__.t = __.t.bind(this);
        global.__utils = utils;

        this.languageManager = new LanguageManager();
        this.languageManager.eventHook(eventEmitter);
        this.langs = this.languageManager._langs;
        global.__lang = this.langs;

        global.BackModule = require('./BackModule');
        global.FrontModule = require('./FrontModule');

        require('./BaseWidget')(this);
        global.BaseWidget = require('./BaseWidget').BaseWidget;

        this.widgetManager = new WidgetManager(this);
        this.widgetManager.eventHook(eventEmitter);
        this.widgets = this.widgetManager._widgets;

        this.modelManager = new ModelManager(this);
        this.modelManager.eventHook(eventEmitter);
        this.models = this.modelManager._databases;

        this.moduleManager = new ModuleManager(this);
        this.moduleManager.eventHook(eventEmitter);
        this.modules = this.moduleManager._modules;

        this.menuManager = new MenuManager(this);
        this.menuManager.eventHook(eventEmitter);
        this.menus = this.menuManager._menus;

        this.pluginManager = new PluginManager(this);
        this.pluginManager.eventHook(PluginManager);
        this.plugins = this.pluginManager._plugins;

    }

    addModule(modulePath) {
        if (path.isAbsolute(modulePath)) {
            if (fs.existsFile(modulePath + '/module.js')) {
                this.modules.push(modulePath);
            } else {
                console.log(modulePath + 'is not Arrow module!');
            }
        }
    }

    config() {
        let self = this;

        buildStructure();

        let exApp = self._expressApplication ;
        /** Init the express application */
        return self.configManager.getCache()
            .then(function () {
                self.moduleManager.getCache();
            })
            .then(function () {
                self.menuManager.makeMenu()
            })
            .then(function () {
                self.menuManager.setCache()
            })
            .then(function () {
                self.pluginManager.getCache()
            })
            .then(function () {
                makeGlobalVariables(self)
            })
            .then(function () {
                expressApp(exApp)
            })
            .then(function () {
                loadPreFunc(exApp, self.beforeFunction)
            })
            .then(function () {
                loadRouteBackend(exApp)
            })
            .then(function () {
                loadSettingMenu(exApp)
            })
            .then(function () {
                loadRouteFrontend(exApp)
            })
            .then(function () {
                handleError(exApp)
            })
            .then(function (app) {
                console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
                return app
            })
    }

    /**
     * Add function that will execute before authentication task
     * @param func
     */

    before(func) {
        if (typeof func == "function") {
            this.beforeFunction.push(func);
        }
    }
}

/**
 *
 * Supporting functions
 */

/**
 * Create app dir if not exist
 */
function buildStructure() {
    utils.createDirectory('app');
    utils.createDirectory('app/custom_filters');
    utils.createDirectory('app/modules');
    utils.createDirectory('app/plugins');
    utils.createDirectory('app/widgets');
    utils.createDirectory('app/middleware');

    utils.createDirectory('core');
    utils.createDirectory('core/custom_filters');
    utils.createDirectory('core/modules');
    utils.createDirectory('core/plugins');
    utils.createDirectory('core/widgets');
}
/**
 *
 * @param arrowApp
 * @returns {boolean}
 */
function makeGlobalVariables(arrowApp) {
    global.__acl = require('./acl');
    global.__services = arrowApp.services;
    global.__configManager = arrowApp.configManager;
    global.__config = arrowApp._config;
    global.__widget = arrowApp.widgets;
    global.__models = arrowApp.models;
    global.__modules = arrowApp.modules;
    global.__menus = arrowApp.menus;
    global.__setting_menu_module = [];
    global.__mailSender = mailer.createTransport(smtpPool(__config.mailer_config));
    return true
}
/**
 *
 * @param app
 * @returns {*}
 */
function expressApp(app) {
    return new Promise(function (fulfill, reject) {
        let expressFunction
        if (fs.existsSync(path.resolve(app.baseFolder + "config/express.js"))) {
            expressFunction = require(app.baseFolder + "config/express");
        } else {
            expressFunction = require("../demo/express");
        }
        fulfill(expressFunction(app));
    });
}

/**
 *
 * @param app
 * @param beforeFunc
 * @returns {*}
 */
function loadPreFunc(app, beforeFunc) {
    return new Promise(function (fulfill, reject) {
        beforeFunc.map(function (func) {
            func(app);
        });

        fulfill(app)
    })
}
/**
 *
 * @param app
 */
function loadRouteBackend(app) {

    /** Check module active/system in backend */

    app.use('/' + app._appConfig.admin_prefix + '/*', require('../middleware/modules-plugin.js'));

    /** Globbing backend route files */
    let adminRoute = __.getOverrideCorePath(__base + 'core/modules/*/backend/route.js', __base + 'app/modules/*/backend/route.js', 3);
    for (let index in adminRoute) {
        if (adminRoute.hasOwnProperty(index)) {
            let myRoute = require(path.resolve(adminRoute[index]));
            if (myRoute.name === 'router') {
                app.use('/' + app._appConfig.admin_prefix, myRoute);
            } else {
                myRoute(app);
            }
        }
    }
}
/**
 *
 * @param app
 */
function loadSettingMenu(app) {
    /** Globbing menu frontend source */
    let core_settings = {};

    __.getGlobbedFiles(__base + 'core/modules/*/frontend/settings/*.js').forEach(function (path) {
        core_settings = __.mergePath(core_settings, path, 4);
    });

    let app_settings = {};
    __.getGlobbedFiles(__base + 'app/modules/*/frontend/settings/*.js').forEach(function (path) {
        app_settings = __.mergePath(app_settings, path, 4);
    });

    let settings = _.assign(core_settings, app_settings);
    for (let index in settings) {
        if (settings.hasOwnProperty(index)) {
            if (Array.isArray(settings[index])) {
                settings[index].forEach(function (routePath) {
                    __setting_menu_module.push(require(path.resolve(routePath))(app, __config));
                });
            } else {
                __setting_menu_module.push(require(path.resolve(settings[index]))(app, __config));
            }
        }
    }
}
/**
 *
 * @param app
 */
function loadRouteFrontend(app) {
    /** Globbing route frontend files */
    let frontRoute = __.getOverrideCorePath(__base + 'core/modules/*/frontend/route.js', __base + 'app/modules/*/frontend/route.js', 3);
    let frontPath = [];
    for (let index in frontRoute) {
        if (frontRoute.hasOwnProperty(index)) {
            frontPath.push(frontRoute[index]);
        }
    }

    frontPath.sort().forEach(function (routePath) {
        let myRoute = require(path.resolve(routePath));
        if (myRoute.name === 'router') {
            app.use('/', myRoute);
        } else {
            myRoute(app);
        }
    });
}
/**
 *
 * @param app
 */
function handleError(app){
    let coreModule = new FrontModule;
    app.get('/404(.html)?', function (req, res) {
        coreModule.render404(req, res);
    });

    /** Assume 'not found' in the error msg is a 404.
     * This is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
     */
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();
        // Log it
        console.error(err.stack);
        // Error page
        res.status(500).render('500', {
            error: err.stack
        });
    });

    /** Assume 404 since no middleware responded */
    app.use(function (req, res) {
        let h = req.header("Accept");
        try {
            if (h.indexOf('text/html') > -1) {
                res.redirect('/404');
            } else {
                res.sendStatus(404);
            }
        } catch (err) {
            res.sendStatus(404);
        }
    });
}

module.exports = ArrowApplication;