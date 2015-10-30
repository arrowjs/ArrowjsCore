'use strict';

/**
 * Module dependencies.
 */
let fs = require('fs'),
    https = require('https'),
    callsite = require('./ArrStack'),
    path = require('path'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    nunjucks = require('nunjucks'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    libFolder = __dirname,
    chalk = require('chalk'),
    mailer = require('nodemailer'),
    EventEmitter = require('events').EventEmitter,
    smtpPool = require('nodemailer-smtp-pool'),
    pluginManager = require('../deprecated/plugins_manager'),
    ServiceManager = require("../manager/ServiceManager"),
    ConfigManager = require("../manager/ConfigManager"),
    RedisCache = require("./RedisCache"),
    WidgetManager = require("../manager/WidgetManager"),
    ModelManager = require("../manager/ModelManager"),
    LanguageManager = require("../manager/LanguageManager"),
    ModuleManager = require("../manager/ModuleManager"),
    MenuManager = require("../manager/MenuManager"),
    SystemLog = require("./SystemLog"),
    utils = require("./utils"),
    __ = require("./global_function");

class ArrowApplication {
    constructor() {

        process.env.NODE_ENV = process.env.NODE_ENV || 'development';

        let eventEmitter = new EventEmitter();
        this.modules = [];
        this.beforeFunction = [];
        this._expressApplication = express();


        let self = this._expressApplication;
        for (let func in self) {
            if (typeof self[func] == 'function') {
                this[func] = self[func].bind(self);
            } else {
                this[func] = self[func]
            }
        }
        let requester = callsite(2);
        this.baseFolder = path.dirname(requester) + '/';
        global.__base = this.baseFolder;
        this._config = __.getRawConfig();

        //make system log
        global.log = SystemLog;

        //Make redis cache
        let redisConfig = this._config.redis || {};
        this.RedisCache = RedisCache.bind(null, redisConfig);
        this.redisCache = RedisCache(redisConfig);

        this.serviceManager = new ServiceManager(this);
        this.serviceManager.eventHook(eventEmitter);
        this.services = this.serviceManager._services;
        //global.__services = this.services;

        this.configManager = new ConfigManager(this);
        this.configManager.eventHook(eventEmitter);
        //global.__configManager = this.configManager;
        this._config = this.configManager._config;
        //global.__config = this._config;

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
        //global.__widget = this.widgets;


        this.modelManager = new ModelManager(this);
        this.modelManager.eventHook(eventEmitter);
        this.models = this.modelManager._databases;
        //global.__models = this.models;

        this.moduleManager = new ModuleManager(this);
        //this.moduleManager.getCache();
        this.moduleManager.eventHook(eventEmitter);
        this.modules = this.moduleManager._modules;
        //global.__modules = this.modules;

        this.menuManager = new MenuManager(this);
        //this.menuManager.makeMenu();
        this.menuManager.eventHook(eventEmitter);
        this.menus = this.menuManager._menus;
        //global.__menus = this.menus;
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

        buildStructure();

        let self = this;
        /**
         * Main application entry file.
         * Please note that the order of loading is important.
         */
        global.__acl = require(libFolder + '/acl');
        global.__menus = {};
        global.__modules = {};
        global.__setting_menu_module = [];


        /** Init plugins */
            //pluginManager.loadAllPlugins();

        self._expressApplication.baseFolder = self.baseFolder;
        self._expressApplication._appConfig = self._config;
        /** Init the express application */
        return new Promise(function (fulfill, reject) {
            self.configManager.getCache()
                .then(self.moduleManager.getCache())
                .then(self.menuManager.makeMenu())
                .then(self.menuManager.setCache())
                .then(makeGlobalVariables(self))
                .then(loadMenuAndModule())
                .then(expressMe(self._expressApplication))
                .then(loadingRouter(self))
                .then(function (app) {
                    console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
                    fulfill(app)
                })
                .catch(function (err) {
                    reject(err);
                    console.log(err)
                });
        })
    }

    before(func) {
        if (typeof func == "function") {
            this.beforeFunction.push(func);
        }
    }
}

/**
 *
 * Support function
 */
function loadingRouter(arrowApp) {
    let app = arrowApp._expressApplication;
    let beforeFunc = arrowApp.beforeFunction;
    /** Store module status (active|unactive) in Redis */
    return new Promise(function (fulfill, reject) {
        /** Module manager */
        if (beforeFunc.length > 0) {
            for (let k in beforeFunc) {
                beforeFunc[k](app);
            }
        }

        /** Check authenticate in backend */
        app.use('/' + __config.admin_prefix + '/*', require(path.resolve(libFolder, '..', 'middleware/modules-plugin.js')));

        /** Globbing backend route files */
        let adminRoute = __.getOverrideCorePath(__base + 'core/modules/*/backend/route.js', __base + 'app/modules/*/backend/route.js', 3);
        for (let index in adminRoute) {
            if (adminRoute.hasOwnProperty(index)) {
                let myRoute = require(path.resolve(adminRoute[index]));
                if (myRoute.name === 'router') {
                    app.use('/' + __config.admin_prefix, myRoute);
                } else {
                    myRoute(app);
                }
            }
        }

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
        fulfill(app);
    })
}

function loadMenuAndModule() {
    let md = require('../deprecated/modules_manager.js');

    let mn = require('../deprecated/menus_manager.js');

    return new Promise(function (fulfill, reject) {
        return mn().then(function (menus) {
            global.__menus = menus;
            return md().then(function (modules) {
                if (Object.keys(modules).length === 0) {
                    return md.loadAllModules().then(function () {
                        fulfill(true);
                    });
                } else {
                    global.__modules = modules;
                    fulfill(true);
                }
            });
        })
    })

}

function buildStructure() {
    /** Create app dir if not exist */
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

function expressMe(app) {

    return new Promise(function (fulfill, reject) {
        return fs.access(app.baseFolder + "config/express.js", function (err, data) {
            let expressFunction;
            if (err) {
                expressFunction = require("../demo/express");
            } else {
                expressFunction = require(app.baseFolder + "config/express");
            }
            expressFunction(app);
            fulfill(app)
        });
    });
}

function makeGlobalVariables(arrowApp) {
    return new Promise(function (fulfill, reject) {
        global.__services = arrowApp.services;
        global.__configManager = arrowApp.configManager;
        global.__config = arrowApp._config;
        global.__widget = arrowApp.widgets;
        global.__models = arrowApp.models;
        global.__modules = arrowApp.modules;
        global.__menus = arrowApp.menus;
        global.__mailSender = mailer.createTransport(smtpPool(__config.mailer_config));
        fulfill(true)
    })
}
module.exports = ArrowApplication;