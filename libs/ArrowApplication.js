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
    Database = require('./database'),
    DefaultManager = require("../manager/DefaultManager"),
    ConfigManager = require("../manager/ConfigManager"),
    buildStructure = require("./buildStructure");

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
        this.beforeAuthenticate = [];
        this.afterAuthenticate = [];
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
        this.structure = buildStructure(__.getStructure());


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
        this.updateConfig = this.configManager.updateConfig.bind(this.configManager);


        this._arrRoutes = {};

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
    start(setting) {
        let self = this;
        let exApp = self._expressApplication;
        /** Init the express application */
        return Promise.resolve()
            .then(function () {
                addRoles(self);
            })
            .then(function () {
                expressApp(exApp, exApp.arrConfig, setting)
            })
            .then(function () {
                loadPreFunc(exApp, self.beforeFunction)
            })
            .then(function () {
                setupManager(self);
            })
            .then(function () {
                loadRouteAndRender(self, setting);
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

    beforeAuthenticate(func) {
        let self = this;
        if (typeof func == "function") {
            self.beforeAuthenticate.push(func.bind(self));
        }
    }

    afterAuthenticate(func) {
        let self = this;
        if (typeof func == "function") {
            self.afterAuthenticate.push(func.bind(self));
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
function loadRouteAndRender(arrow, userSetting) {
    let defaultDatabase = {};
    let defaultQueryResolve = function () {
        return new Promise(function (fulfill, reject) {
            fulfill("No models")
        })
    };
    if (arrow.models && Object.keys(arrow.models).length > 0) {
        if (_.isEmpty(defaultDatabase)) {
            defaultDatabase = Database(arrow);
        }
        arrow.models.rawQuery = defaultDatabase.query ? defaultDatabase.query.bind(defaultDatabase) : defaultQueryResolve;
    }
    //Object.keys(arrow.models).forEach(function (modelName) {
    //    if ("associate" in arrow.models[modelName]) {
    //        let association = arrow.models[modelName].associate();
    //        if(arrow.models[modelName]) {
    //            console.log(association[modelName]);
    //            let relation = association[modelName].type;
    //            if(typeof arrow.models[modelName][relation] === 'function') {
    //                arrow.models[modelName][relation](arrow.models[modelName],association[modelName].option);
    //            }
    //        }
    //    }
    //
    //});

    arrow._componentList.map(function (key) {
        Object.keys(arrow[key]).map(function (componentKey) {
            logger.info("Arrow loaded: '" + key + "' - '" + componentKey + "'");
            let routeConfig = arrow[key][componentKey]._structure.route;
            if (routeConfig) {
                Object.keys(routeConfig.path).map(function (second_key) {
                    let defaultRouteConfig = routeConfig.path[second_key];
                    if (arrow[key][componentKey].routes[second_key]) {
                        let componentRouteSetting = arrow[key][componentKey].routes[second_key];
                        handleComponentRouteSetting(arrow, componentRouteSetting, defaultRouteConfig, key, userSetting, componentKey);
                    } else {

                        let componentRouteSetting = arrow[key][componentKey].routes;
                        //Handle Route Path;
                        handleComponentRouteSetting(arrow, componentRouteSetting, defaultRouteConfig, key, userSetting, componentKey);
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
function expressApp(app, config, setting) {
    return new Promise(function (fulfill, reject) {
        let expressFunction;
        if (fs.existsSync(path.resolve(app.arrFolder + "config/express.js"))) {
            expressFunction = require(app.arrFolder + "config/express");
        } else {
            expressFunction = require("../config/express");
        }
        fulfill(expressFunction(app, config, setting));
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

function handleComponentRouteSetting(arrow, componentRouteSetting, defaultRouteConfig, key, setting, componentKey) {
    let component = arrow[key][componentKey];
    let componentName = arrow[key][componentKey].name;
    let viewInfo = arrow[key][componentKey].views;
    //Handle Route Path;
    let route = express.Router();
    Object.keys(componentRouteSetting).map(function (path_name) {

        //Check path_name
        let routePath = path_name[0] === '/' ? path_name : "/" + componentName + "/" + path_name;

        //handle prefix
        if (defaultRouteConfig.prefix && defaultRouteConfig.prefix[0] !== "/") {
            defaultRouteConfig.prefix = "/" + defaultRouteConfig.prefix
        }
        let prefix = defaultRouteConfig.prefix || '/';

        let arrayMethod = Object.keys(componentRouteSetting[path_name]).filter(function (method) {
            if (componentRouteSetting[path_name][method].name) {
                arrow._arrRoutes[componentRouteSetting[path_name][method].name] = path.normalize(prefix + routePath);
            }

            //handle function
            let routeHandler = componentRouteSetting[path_name][method].handler;
            let authenticate = componentRouteSetting[path_name][method].authenticate !== undefined ? componentRouteSetting[path_name][method].authenticate : defaultRouteConfig.authenticate;

            let arrayHandler = [];
            if (arrayHandler && _.isArray(routeHandler)) {
                arrayHandler = routeHandler.filter(function (func) {
                    if (_.isFunction(func)) {
                        return func
                    }
                });
            } else if (_.isFunction(routeHandler)) {
                arrayHandler.push(routeHandler)
            } else if (!_.isString(authenticate)) {
                return
            }

            //Add viewRender
            if (!_.isEmpty(viewInfo) && !_.isString(authenticate)) {
                arrayHandler.splice(0, 0, overrideViewRender(arrow, viewInfo, componentName, component))
            }


            //handle role
            if (setting && setting.role) {
                let permissions = componentRouteSetting[path_name][method].permissions;
                if (permissions && !_.isString(authenticate)) {
                    arrayHandler.splice(0, 0, arrow.passportSetting.handlePermission);
                    arrayHandler.splice(0, 0, handleRole(arrow, permissions, componentName, key))
                }
            }

            //add middleware after authenticate;
            if (!_.isEmpty(arrow.afterAuthenticate)) {
                arrow.afterAuthenticate.map(function (func) {
                    arrayHandler.splice(0, 0, func)
                })
            }

            //handle Authenticate
            if (setting && setting.passport) {
                if (authenticate) {
                    arrayHandler.splice(0, 0, handleAuthenticate(arrow, authenticate))
                }
            }

            //add middleware before authenticate;
            if (!_.isEmpty(arrow.beforeAuthenticate)) {
                arrow.beforeAuthenticate.map(function (func) {
                    arrayHandler.splice(0, 0, func)
                })
            }

            //Add to route
            if (method === "param") {
                if (_.isString(componentRouteSetting[path_name][method].key) && !_.isArray(componentRouteSetting[path_name][method].handler)) {
                    return route.param(componentRouteSetting[path_name][method].key, componentRouteSetting[path_name][method].handler);
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

function overrideViewRender(application, componentView, componentName, component) {
    return function (req, res, next) {
        // Grab reference of render
        let _render = res.render;
        let self = this;
        if (_.isArray(componentView)) {
            res.render = makeRender(req, res, application, componentView, componentName, component);
        } else {
            Object.keys(componentView).map(function (key) {
                res[key] = res[key] || {};
                res[key].render = makeRender(req, res, application, componentView[key], componentName, component[key]);
            });
            res.render = res[Object.keys(componentView)[0]].render
        }
        next();
    }
}

function makeRender(req, res, application, componentView, componentName, component) {
    return function (view, options, callback) {

        var done = callback;
        var opts = options || {};

        // merge res.locals
        _.assign(opts, res.locals);

        //remove flash message
        delete req.session.flash;

        // support callback function as second arg
        if (typeof options === 'function') {
            done = options;
            opts = res.locals || {};
        }

        // default callback to respond
        done = done || function (err, str) {
            if (err) return req.next(err);
            res.send(str);
        };

        if (application._config.viewExtension && view.indexOf(application._config.viewExtension) === -1 && view.indexOf(".") === -1) {
            view += "." + application._config.viewExtension;
        }
        component.viewEngine.loaders[0].pathsToNames = {};
        component.viewEngine.loaders[0].cache = {};
        component.viewEngine.loaders[0].searchPaths = componentView.map(function (obj) {
            return handleView(obj, application, componentName);
        });

        component.viewEngine.render(view, opts, done);
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
    let passport = application.passport;
    if (_.isString(name)) {
        if (application.passportSetting[name]) {
            let strategy = application.passportSetting[name].strategy || name;
            let callback = application.passportSetting[name].callback;
            let option = application.passportSetting[name].option || {};
            if (callback) return passport.authenticate(strategy, option, callback);
            return passport.authenticate(strategy, option);
        }
    } else if (_.isBoolean(name)) {
        if (application.passportSetting.checkAuthenticate && _.isFunction(application.passportSetting.checkAuthenticate)) {
            return application.passportSetting.checkAuthenticate
        }
    }
    return function (req, res, next) {
        next()
    }
}

function handleRole(application, permissions, componentName, key) {
    let arrayPermissions = [];
    if (_.isArray(permissions)) {
        arrayPermissions = permissions
    } else {
        arrayPermissions.push(permissions);
    }
    return function handleRoles(req, res, next) {
        req.permissions = req.session.permissions;
        if (req.permissions && req.permissions[key] && req.permissions[key][componentName]) {
            let checkedPermission = req.permissions[key][componentName].filter(function (key) {
                if (arrayPermissions.indexOf(key.name) > -1) {
                    return key
                }
            }).map(function (data) {
                return data.name
            });
            if (!_.isEmpty(checkedPermission)) {
                req.permissions = checkedPermission;
                req.hasPermission = true
            }
        } else {
            req.hasPermission = false;
        }
        next();
    }
}

function loadingGlobalFunction(self) {
    global.ArrowHelper = {};
    __.getGlobbedFiles(path.resolve(__dirname, "..", "helpers/*.js")).map(function (link) {
        let arrowObj = require(link);
        Object.keys(arrowObj).map(function (key) {
            if (_.isFunction(arrowObj[key])) {
                ArrowHelper[key] = arrowObj[key].bind(self)
            } else {
                ArrowHelper[key] = arrowObj[key]
            }
        })
    });
    __.getGlobbedFiles(path.normalize(__base + self._config.ArrowHelper + "*.js")).map(function (link) {
        let arrowObj = require(link);
        Object.keys(arrowObj).map(function (key) {
            if (_.isFunction(arrowObj[key])) {
                ArrowHelper[key] = arrowObj[key].bind(self)
            } else {
                ArrowHelper[key] = arrowObj[key]
            }
        })
    });

    //Add some support function
    global.__ = ArrowHelper.__
}


function addRoles(self) {
    self.permissions = {};
    self._componentList.map(function (key) {
        let managerName = key + "Manager";
        self.permissions[key] = self[managerName].getPermissions();
    });
}
module.exports = ArrowApplication;