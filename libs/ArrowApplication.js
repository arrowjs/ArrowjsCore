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
    RedisCache = require("./RedisCache"),
    logger = require("./logger"),
    utils = require("./utils"),
    __ = require("./global_function"),
    EventEmitter = require('events').EventEmitter,
    DefaultManager = require("../manager/DefaultManager"),
    ConfigManager = require("../manager/ConfigManager"),
    buildStructure = require("./buildStructure"),
    ViewEngine = require("../libs/ViewEngine");

//let coreEvent = new EventEmitter();

class ArrowApplication {

    /**
     * Constructor
     * @param setting
     */
    constructor(setting) {
        //if NODE_ENV does not exist, use development by default
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';

        let eventEmitter = new EventEmitter();
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
        this.arrFolder = path.dirname(requester) + '/';


        global.__base = this.arrFolder;
        this._config = __.getRawConfig();  //Read config/config.js into this._config
        //let structure = __.getStructure();
        this.structure = buildStructure(__.getStructure());

        //this.arrlog = SystemLog;

        //Make redis cache
        let redisConfig = this._config.redis || {};
        let redisFunction = RedisCache(redisConfig);
        var redisClient, redisSubscriber;

        if (redisConfig.type === "fakeredis") {
            redisClient = redisFunction("client");
            redisSubscriber = redisFunction.bind(null, redisConfig);
        } else {
            redisClient = redisFunction(redisConfig);
            redisSubscriber = redisFunction.bind(null, redisConfig);
        }

        this.redisClient = redisClient;
        this.redisSubscriber = redisSubscriber;

        //TODO: why we assign many properties of ArrowApplication to _expressApplication. It is redundant
        this._expressApplication.arrFolder = this.arrFolder;
        this._expressApplication.arrConfig = this._config;
        this._expressApplication.redisCache = this.redisCache;
        this._expressApplication._arrApplication = this;
        this._expressApplication.usePassport = require("./loadPassport");
        this._expressApplication.useFlashMessage = require("./flashMessage");
        this._expressApplication.useSession = require("./useSession");

        this._componentList = [];

        let languagePath = __base + this._config.langPath + '/*.js';
        this._lang = {};
        __.getGlobbedFiles(languagePath).forEach(function (file) {
            this._lang[path.basename(file, '.js')] = require(file);
        }.bind(this));

        loadingGlobalFunction(this);

        this.configManager = new ConfigManager(this, "config");
        this.configManager.eventHook(eventEmitter);
        this._config = this.configManager._config;
        this.getConfig = this.configManager.getConfig.bind(this.configManager);
        this.setConfig = this.configManager.setConfig.bind(this.configManager);

        let componentsRender = ViewEngine(this.arrFolder, {
            express: this._expressApplication,
            autoescape: true,
            throwOnUndefined: false,
            trimBlocks: false,
            lstripBlocks: false,
            watch: false,
            noCache: true
            //tags: {
            //    blockStart: '<%',
            //    blockEnd: '%>',
            //    variableStart: '<$',
            //    variableEnd: '$>',
            //    commentStart: '<#',
            //    commentEnd: '#>'
            //}
        });
        this.viewTemplateEngine = componentsRender;
        Object.keys(this.structure).map(function (managerKey) {
            let key = managerKey;
            let managerName = managerKey + "Manager";
            this[managerName] = new DefaultManager(this, key);
            this[managerName].eventHook(eventEmitter);
            this[managerName].loadComponents(key);
            this[key] = this[managerName]["_" + key];
            this._componentList.push(key);
        }.bind(this));
    }


    /**
     * Kick start express application and listen at default port
     * @returns {Promise.<T>}
     */
    start() {
        let self = this;
        let exApp = self._expressApplication;
        /** Init the express application */
        return Promise.resolve()
            .then(function () {
                expressApp(exApp)
            })
            .then(function () {
                loadPreFunc(exApp, self.beforeFunction)
            })
            .then(function () {
                setupManager(self);
            })
            .then(function () {
                loadRouteAndRender(self);
            })
            .then(function (app) {
                exApp.listen(self._config.port, function () {
                    logger.info('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration');
                    logger.info('Application started on port ' + self._config.port, ', Process ID: ' + process.pid);
                });
                return app;
            });

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
 * Load routers
 * @param arrow
 */

//TODO testing render ;
function loadRouteAndRender(arrow) {
    arrow._componentList.map(function (key) {
    console.log(arrow[key]);
        Object.keys(arrow[key]).map(function (component) {
            let routeConfig = arrow[key][component]._structure.route;
            if (routeConfig) {
                Object.keys(routeConfig.path).map(function (second_key) {
                    let defaultRouteConfig = routeConfig.path[second_key];
                    if (arrow[key][component].routes[second_key]) {
                        let componentRouteSetting = arrow[key][component].routes[second_key];
                        let componentName = arrow[key][component].name;
                        handleComponentRouteSetting(componentRouteSetting, componentName, defaultRouteConfig, arrow, arrow[key][component].views, second_key);
                    } else {

                        let componentRouteSetting = arrow[key][component].routes;
                        let componentName = arrow[key][component].name;
                        //Handle Route Path;
                        handleComponentRouteSetting(componentRouteSetting, componentName, defaultRouteConfig, arrow, arrow[key][component].views);
                    }
                });
            }
        })
    })
}

/**
 *
 * @param app
 * @returns {*}
 */
function expressApp(app) {
    return new Promise(function (fulfill, reject) {
        let expressFunction;
        if (fs.existsSync(path.resolve(app.arrFolder + "config/express.js"))) {
            expressFunction = require(app.arrFolder + "config/express");
        } else {
            expressFunction = require("../config/express");
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


function setupManager(app) {
    try {
        fs.accessSync(path.resolve(app.arrFolder + "config/manager.js"));
        let setupManager = require(app.arrFolder + "config/manager");
        setupManager(app);
    } catch (err) {

    }
    return null;
}

function handleComponentRouteSetting(componentRouteSetting, componentName, defaultRouteConfig, arrow, view) {

    //Handle Route Path;
    Object.keys(componentRouteSetting).map(function (path) {
        let route = express.Router();

        //Check path
        let routePath = path[0] === '/' ? path : "/" + componentName + "/" + path;

        //handle prefix
        if (defaultRouteConfig.prefix && defaultRouteConfig.prefix[0] !== "/") {
            defaultRouteConfig.prefix = "/" + defaultRouteConfig.prefix
        }
        let prefix = defaultRouteConfig.prefix || '/';

        let arrayMethod = Object.keys(componentRouteSetting[path]).filter(function (method) {
            //handle function
            let routeHandler = componentRouteSetting[path][method].handler;
            let authenticate = componentRouteSetting[path][method].authenticate !== undefined ? componentRouteSetting[path][method].authenticate : defaultRouteConfig.authenticate;

            let arrayHandler = [];
            if (arrayHandler && _.isArray(routeHandler)) {
                arrayHandler = routeHandler.filter(function (func) {
                    if (_.isFunction(func)) {
                        return func
                    }
                });
            } else if (_.isFunction(routeHandler)) {
                arrayHandler.push(routeHandler)
            } else if (!_.isString(authenticate)){
                return
            }

            //Add viewRender
            if (!_.isEmpty(view) && !_.isString(authenticate)) {
                arrayHandler.splice(0, 0, overrideViewRender(arrow, view, componentName))
            }

            //handle Authenticate
            if (authenticate) {
                arrayHandler.splice(0, 0, handleAuthenticate(arrow, authenticate))
            }

            //handle role
            let roles = componentRouteSetting[path][method].role;
            if (roles && !_.isString(authenticate)) {
                arrayHandler.splice(0, 0, handleRole(roles))
            }

            //Add to route
            if (method === "param") {
                if (_.isString(componentRouteSetting[path][method].key) && !_.isArray(componentRouteSetting[path][method].handler)) {
                    return route.param(componentRouteSetting[path][method].key, componentRouteSetting[path][method].handler);
                }
            } else if (method === 'all') {
                return route.route(routePath)
                    [method](arrayHandler);
            } else if (route[method] && ['route', 'use'].indexOf(method) === -1) {
                return route.route(routePath)
                    [method](arrayHandler)
            }
        });
        !_.isEmpty(arrayMethod) && arrow.use(prefix, route);
    });
}

function overrideViewRender(application, componentView, componentName) {
    return function (req, res, next) {
        // Grab reference of render
        let _render = res.render;
        let self = this;
        if (_.isArray(componentView)) {
            res.render = makeRender(application, componentView, req, res, componentName);
        } else {
            Object.keys(componentView).map(function (key) {
                res[key] = res[key] || {};
                res[key].render = makeRender(application, componentView[key], req, res, componentName);
            });
            res.render = res[Object.keys(componentView)[0]].render
        }
        next();
    }
}

function makeRender(application, componentView, req, res, componentName) {
    return function (view, options, callback) {
        var done = callback;
        var opts = options || {};

        // support callback function as second arg
        if (typeof options === 'function') {
            done = options;
            opts = {};
        }

        // merge res.locals
        opts._locals = res.locals || {};

        // default callback to respond
        done = done || function (err, str) {
                if (err) return req.next(err);
                res.send(str);
            };

        if (application._config.viewExtension && view.indexOf(application._config.viewExtension) === -1) {
            view += "." + application._config.viewExtension;
        }

        application.viewTemplateEngine.loaders[0].pathsToNames = {};
        application.viewTemplateEngine.loaders[0].cache = {};
        application.viewTemplateEngine.loaders[0].searchPaths = componentView.map(function (obj) {
            return handleView(obj, application, componentName);
        });

        application.viewTemplateEngine.render(view, options, done)
    };
}


function handleView(obj, application, componentName) {
    let miniPath = obj.func(application._config, componentName);
    let normalizePath;
    if (miniPath[0] === "/") {
        normalizePath = path.normalize(obj.base + "/" + miniPath);
    } else {
        normalizePath = path.normalize(obj.fatherBase + "/" + miniPath)
    }
    return normalizePath
}

function handleAuthenticate(application, name) {
    let passport  = application.passport;
    if(_.isString(name)) {
        //TODO need minify this code
        if (application.passportSetting[name]) {
            let callback = application.passportSetting[name].callback;
            let option = application.passportSetting[name].option || {};
            if (callback) return passport.authenticate(name, option,callback);
            return passport.authenticate(name, option);
        } else  if (application.passportSetting["local"]){
            let callback = application.passportSetting["local"].callback;
            let option = application.passportSetting["local"].option || {};
            if (callback) return passport.authenticate("local", option,callback);
            return passport.authenticate("local", option);
        }

    } else if (_.isBoolean(name)) {
        if(application.passportSetting.checkAuthenticate && _.isFunction(application.passportSetting.checkAuthenticate)) {
            return application.passportSetting.checkAuthenticate
        }
    }
    return function (req, res, next) {
        next()
    }
}

function handleRole(roles) {
    return function handleRoles(req, res, next) {
        next()
    }
}

function loadingGlobalFunction(self) {
    global.t = function (key) {
        return self._lang[self._config.language][key] || "undefined";
    }
}

module.exports = ArrowApplication;