'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
    arrowStack = require('./ArrStack'),
    path = require('path'),
    express = require('express'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    RedisCache = require("./RedisCache"),
    installLog = require("./logger").init,
    logger = require('./logger'),
    __ = require("./global_function"),
    EventEmitter = require('events').EventEmitter,
    r = require('nunjucks').runtime,
    DefaultManager = require("../manager/DefaultManager"),
    ConfigManager = require("../manager/ConfigManager"),
    buildStructure = require("./buildStructure"),
    socket_io = require('socket.io'),
    http = require('http'),
    socketRedisAdapter = require('socket.io-redis'),
    ViewEngine = require("../libs/ViewEngine"),
    fsExtra = require('fs-extra'),
    loadingLanguage = require("./i18n").loadLanguage;
let eventEmitter;
/**
 * ArrowApplication is a singleton object. It is heart of Arrowjs.io web app. it wraps Express and adds following functions:
 * support Redis, multi-languages, passport, check permission and socket.io / websocket
 */

class ArrowApplication {
    /**
     *
     * @param {object} setting - {passport: bool ,role : bool, order :bool}
     * <ul>
     *     <li>passport: true, turn on authentication using Passport module</li>
     *     <li>role: true, turn on permission checking, RBAC</li>
     *     <li>order: true, order router priority rule.</li>
     * </ul>
     */
    constructor(setting) {
        //if NODE_ENV does not exist, use development by default
        /* istanbul ignore next */
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';

        this.beforeAuth = [];  //add middle-wares before user authenticates
        this.afterAuth = [];   //add middle-ware after user authenticates
        this.plugins = [];   //add middle-ware after user authenticates
        let app = express();

        global.Arrow = {};

        this.arrowErrorLink = {};
        //Move all functions of express to ArrowApplication
        //So we can call ArrowApplication.listen(port)
        _.assign(this, app);
        this.expressApp = function (req, res, next) {
            this.handle(req, res, next);
        }.bind(this);

        // 0 : location of this file
        // 1 : location of index.js (module file)
        // 2 : location of server.js file
        let requester = arrowStack(2);
        this.arrFolder = path.dirname(requester) + '/';

        //assign current Arrowjs application folder to global variable
        global.__base = this.arrFolder;

        //Read config/config.js into this._config
        this._config = __.getRawConfig();

        //Read and parse config/structure.js
        this.structure = buildStructure(__.getStructure());

        //display longer stack trace in console
        if (this._config.long_stack) {
            require('longjohn')
        }

        installLog(this);
        this.logger = logger;

        this.middleware = Object.create(null);
        //Add passport and its authentication strategies
        this.middleware.passport = require("../config/middleware/loadPassport").bind(this);

        //Display flash message when user reloads view
        this.middleware.flashMessage = require("../config/middleware/flashMessage").bind(this);

        //Use middleware express-session to store user session
        this.middleware.session = require("../config/middleware/useSession").bind(this);

        //Serve static resources when not using Nginx.
        //See config/view.js section resource
        this.middleware.serveStatic = require("../config/middleware/staticResource").bind(this);

        this.middleware.helmet = require("helmet");
        this.middleware.bodyParser = require("body-parser");
        this.middleware.cookieParser = require("cookie-parser");
        this.middleware.morgan = require("morgan");
        this.middleware.methodOverride = require('method-override');


        //Load available languages. See config/i18n.js and folder /lang
        loadingLanguage(this._config);

        //Bind all global functions to ArrowApplication object
        loadingGlobalFunction(this);


        //Declare _arrRoutes to store all routes of features
        this._arrRoutes = Object.create(null);

        this.utils = Object.create(null);
        this.utils.dotChain = getDataByDotNotation;
        this.utils.fs = fsExtra;
        this.utils.loadAndCreate = loadSetting.bind(this);
        this.utils.markSafe = r.markSafe;

        this.arrowSettings = Object.create(null);
    }

    /**
     * When user requests an URL, execute this function before server checks in session if user has authenticates
     * If web app does not require authentication, beforeAuthenticate and afterAuthenticate are same. <br>
     * beforeAuthenticate > authenticate > afterAuthenticate
     * @param {function} func - function that executes before authentication
     */
    beforeAuthenticate(func) {
        let self = this;
        /* istanbul ignore next */
        return new Promise(function (fulfill, reject) {
            if (typeof func == "function") {
                self.beforeAuth.push(func.bind(self));
                fulfill()
            } else {
                reject(new Error("Cant beforeAuthenticate: not an function"));
            }
        });
    }

    /**
     * When user requests an URL, execute this function after server checks in session if user has authenticates
     * This function always runs regardless user has authenticated or not
     * @param {function} func - function that executes after authentication
     */
    afterAuthenticate(func) {
        let self = this;
        /* istanbul ignore next */
        return new Promise(function (fulfill, reject) {
            if (typeof func == "function") {
                self.afterAuth.push(func.bind(self));
                fulfill()
            } else {
                reject(new Error("Cant afterAuthenticate: not an function"));
            }
        })
    }

    /**
     * Turn object to become property of ArrowApplication
     * @param {object} obj - object parameter
     */

    addGlobal(obj) {
        /* istanbul ignore next */
        return new Promise(function (fulfill, reject) {
            if (_.isObject(obj)) {
                _.assign(Arrow, obj);
                fulfill()
            } else {
                reject(new Error("Cant addGlobal: not an Object"));
            }
        });
    }

    /**
     * Add plugin function to ArrowApplication.plugins, bind this plugin function to ArrowApplication object
     * @param {function} plugin - plugin function
     * <p><a target="_blank" href="http://www.smashingmagazine.com/2014/01/understanding-javascript-function-prototype-bind/">See more about bind</a></p>
     */
    addPlugin(plugin) {
        let self = this;
        /* istanbul ignore next */
        return new Promise(function (fulfill, reject) {
            if (_.isFunction(plugin)) {
                self.plugins.push(plugin.bind(self));
                fulfill()
            } else {
                reject(new Error("Cant addPlugin: not an Function"));
            }
        })

    }

    /**
     * Kick start express application and listen at default port
     * @param {object} setting - {passport: boolean, role: boolean}
     */
    start(setting) {
        let self = this;

        self.arrowSettings = setting;
        let stackBegin;
        return Promise.resolve()
            .then(function connectRedis() {
                //Redis connection
                let redisConfig = self._config.redis || {};
                return RedisCache(redisConfig);
            })
            .then(function (redisFunction) {
                //Make redis cache
                /* istanbul ignore next */
                let redisConfig = self._config.redis || {};
                let redisClient = redisFunction(redisConfig);
                let redisSubscriber = redisFunction.bind(null, redisConfig);

                self.redisClient = redisClient;
                self.redisSubscriber = redisSubscriber;
            })
            .then(function connectDatabase() {
                return require('./database').connectDB(self)
            })
            .then(function setupManager() {
                //Share eventEmitter among all kinds of Managers. This helps Manager object notifies each other
                //when configuration is changed
                eventEmitter = new EventEmitter();

                self.configManager = new ConfigManager(self, "config");
                //subscribes to get notification from shared eventEmitter object
                self.configManager.eventHook(eventEmitter);

                //Create shortcut call
                self.addConfig = addConfig.bind(self);
                self.addConfigFile = addConfigFile.bind(self);
                self.getConfig = self.configManager.getConfig.bind(self.configManager);
                self.setConfig = self.configManager.setConfig.bind(self.configManager);
                self.updateConfig = self.configManager.updateConfig.bind(self.configManager);

                //_componentList contains name property of composite features, singleton features, widgets, plugins
                self._componentList = [];
                Object.keys(self.structure).map(function (managerKey) {
                    let key = managerKey;
                    let managerName = managerKey + "Manager";
                    self[managerName] = new DefaultManager(self, key);
                    self[managerName].eventHook(eventEmitter);
                    //load sub components of
                    self[managerName].loadComponents(key);
                    self[key] = self[managerName]["_" + key];
                    self._componentList.push(key);
                }.bind(self));
            })
            .then(function configRenderLayout() {
                let viewEngineSetting = _.assign(self._config.nunjuckSettings || {}, {express: self._expressApplication});
                let applicationView = ViewEngine(self.arrFolder, viewEngineSetting, self);
                self.applicationENV = applicationView;

                self.render = function (view, options, callback) {
                    let application = self;
                    var done = callback;

                    var opts = options || {};
                    /* istanbul ignore else */
                    if (typeof options === "function") {
                        done = options;
                        opts = {};
                    }

                    _.assign(opts, application.locals);

                    if (application._config.viewExtension && view.indexOf(application._config.viewExtension) === -1 && view.indexOf(".") === -1) {
                        view += "." + application._config.viewExtension;
                    }

                    let arrayPart = view.split(path.sep);
                    arrayPart = arrayPart.map(function (key) {
                        if (key[0] === ":") {
                            key = key.replace(":", "");
                            return application.getConfig(key);
                        } else {
                            return key
                        }
                    });

                    let newLink = arrayPart.join(path.sep);

                    newLink = path.normalize(application.arrFolder + newLink);

                    application.applicationENV.loaders[0].pathsToNames = {};
                    application.applicationENV.loaders[0].cache = {};
                    application.applicationENV.loaders[0].searchPaths = [path.dirname(newLink) + path.sep];
                    return application.applicationENV.render(newLink, opts, done);
                }.bind(self);

                self.renderString = applicationView.renderString.bind(applicationView);
            })
            .then(function () {
                let resolve = Promise.resolve();
                self.plugins.map(function (plug) {
                    resolve = resolve.then(function () {
                        return plug()
                    })
                });
                return resolve
            })
            .then(function () {
                addRoles(self);
                if (self.getConfig("redis.type") !== "fakeredis") {
                    let resolve = self.configManager.getCache();
                    self._componentList.map(function (key) {
                        let managerName = key + "Manager";
                        resolve = resolve.then(function () {
                            return self[managerName].getCache()
                        })
                    });
                    return resolve
                } else {
                    return Promise.resolve();
                }
            })
            .then(function () {
                //init Express app
                return configureExpressApp(self, self.getConfig(), setting)
            })
            .then(function () {
                return associateModels(self);
            })
            .then(function () {
                return circuit_breaker(self)
            })
            .then(function () {
                if (setting && setting.order) {
                    stackBegin = self._router.stack.length;
                }
                return loadRoute_Render(self, setting);
            })
            .then(function () {
                if (setting && setting.order) {
                    let coreRoute = self._router.stack.slice(0, stackBegin);
                    let newRoute = self._router.stack.slice(stackBegin);
                    newRoute = newRoute.sort(function (a, b) {
                        if (a.handle.order) {
                            if (b.handle.order) {
                                if (a.handle.order > b.handle.order) {
                                    return 1
                                } else if (a.handle.order < b.handle.order) {
                                    return -1
                                } else {
                                    return 0
                                }
                            } else {
                                return 0
                            }
                        } else {
                            if (b.handle.order) {
                                return 1
                            } else {
                                return 0
                            }
                        }
                    });
                    coreRoute = coreRoute.concat(newRoute);
                    self._router.stack = coreRoute
                }
                return handleError(self)
            })
            .then(function () {
                return http.createServer(self.expressApp);
            })
            .then(function (server) {
                self.httpServer = server;
                if (self.getConfig('websocket_enable') && self.getConfig('websocket_folder')) {
                    let io = socket_io(server);
                    if (self.getConfig('redis.type') !== 'fakeredis') {
                        let redisConf = {host: self.getConfig('redis.host'), port: self.getConfig('redis.port')};
                        io.adapter(socketRedisAdapter(redisConf));
                    }
                    self.io = io;

                    __.getGlobbedFiles(path.normalize(self.arrFolder + self.getConfig('websocket_folder'))).map(function (link) {
                        let socketFunction = require(link);
                        /* istanbul ignore else */
                        if (_.isFunction(socketFunction)) {
                            socketFunction(io);
                        }
                    })
                }

                server.listen(self.getConfig("port"), function () {
                    logger.info('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration');
                    logger.info('Application started on port ' + self.getConfig("port"), ', Process ID: ' + process.pid);
                });
                /* istanbul ignore next */
            })
            .catch(function (err) {
                logger.error(err)
            });
    }

    close() {
        var self = this;
        return new Promise(function (fulfill, reject) {
            /* istanbul ignore else */
            if (self.httpServer) {
                self.httpServer.close(function (err) {
                    /* istanbul ignore if */
                    if (err) {
                        reject(err)
                    } else {
                        fulfill(self.httpServer)
                    }
                })
            } else {
                fulfill(self.httpServer)
            }
        })
    }
}

/**
 * Associate all models that are loaded into ArrowApplication.models. Associate logic defined in /config/database.js
 * @param {ArrowApplication} arrow
 * @return {ArrowApplication} arrow
 */

function associateModels(arrow) {
    let defaultDatabase = require('./database').db();
    if (arrow.models && Object.keys(arrow.models).length > 0) {
        /* istanbul ignore next */
        let defaultQueryResolve = function () {
            return new Promise(function (fulfill, reject) {
                fulfill("No models")
            })
        };

        //Load model associate rules defined in /config/database.js
        let databaseFunction = require(arrow.arrFolder + "config/database");

        Object.keys(arrow.models).forEach(function (modelName) {
            if ("associate" in arrow.models[modelName]) {
                arrow.models[modelName].associate(arrow.models);
            }
        });

        /* istanbul ignore else */
        if (databaseFunction.associate) {
            let resolve = Promise.resolve();
            resolve.then(function () {
                //Execute models associate logic in /config/database.js
                return databaseFunction.associate(arrow.models)
            }).then(function () {
                defaultDatabase.sync();  //Sequelize.sync: sync all defined models to the DB.
            })
        }


        //Assign raw query function of Sequelize to arrow.models object
        //See Sequelize raw query http://docs.sequelizejs.com/en/latest/docs/raw-queries/
        /* istanbul ignore next */
        if (defaultDatabase.query) {
            arrow.models.rawQuery = defaultDatabase.query.bind(defaultDatabase);
            _.merge(arrow.models, defaultDatabase);
        } else {
            arrow.models.rawQuery = defaultQueryResolve;
        }

    }
    return arrow
}


/**
 * load feature's routes and render
 * @param {ArrowApplication } arrow
 * @param {object} userSetting
 */
function loadRoute_Render(arrow, userSetting) {

    arrow._componentList.map(function (key) {
        Object.keys(arrow[key]).map(function (componentKey) {
            /** display loaded feature in console log when booting Arrowjs application */
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
    });
    return arrow;
}

/**
 * Run /config/express.js to configure Express object
 * @param app - ArrowApplication object
 * @param config - this.configManager.getConfig
 * @param setting - parameters in application.start(setting);
 */
function configureExpressApp(app, config, setting) {
    return new Promise(function (fulfill, reject) {
        let expressFunction;
        /* istanbul ignore else */
        if (fs.existsSync(path.resolve(app.arrFolder + "config/express.js"))) {
            expressFunction = require(app.arrFolder + "config/express");
        } else {
            reject(new Error("Cant find express.js in folder config"))
        }
        fulfill(expressFunction(app, config, setting));
    });
}


/**
 *
 * @param arrow
 * @param componentRouteSetting
 * @param defaultRouteConfig
 * @param key
 * @param setting
 * @param componentKey
 */
function handleComponentRouteSetting(arrow, componentRouteSetting, defaultRouteConfig, key, setting, componentKey) {
    let component = arrow[key][componentKey];
    let componentName = arrow[key][componentKey].name;
    let viewInfo = arrow[key][componentKey].views;
    //Handle Route Path;
    let route = express.Router();
    route.componentName = componentName;

    Object.keys(componentRouteSetting).map(function (path_name) {
        //Check path_name
        /* istanbul ignore next */
        let routePath = path_name[0] === "/" ? path_name : "/" + componentName + "/" + path_name;

        //handle prefix
        /* istanbul ignore if */
        if (defaultRouteConfig.prefix && defaultRouteConfig.prefix[0] !== "/") {
            defaultRouteConfig.prefix = "/" + defaultRouteConfig.prefix
        }
        let prefix = defaultRouteConfig.prefix || "/";

        let arrayMethod = Object.keys(componentRouteSetting[path_name]).filter(function (method) {
            if (componentRouteSetting[path_name][method].name) {
                arrow._arrRoutes[componentRouteSetting[path_name][method].name] = path.normalize(prefix + routePath);
            }
            //handle function
            let routeHandler;
            componentRouteSetting[path_name][method].handler = componentRouteSetting[path_name][method].handler || function (req, res, next) {
                    next(new Error("Cant find controller"));
                };


            routeHandler = componentRouteSetting[path_name][method].handler;
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
                arrayHandler.splice(0, 0, overrideViewRender(arrow, viewInfo, componentName, component, key))
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
            if (!_.isEmpty(arrow.afterAuth)) {
                arrow.afterAuth.map(function (func) {
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
            if (!_.isEmpty(arrow.beforeAuth)) {
                arrow.beforeAuth.map(function (func) {
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
                if (componentRouteSetting[path_name][method].order) {
                    let newRoute = express.Router();
                    newRoute.componentName = componentName;
                    newRoute.order = componentRouteSetting[path_name][method].order;
                    newRoute.route(routePath)
                        [method](arrayHandler);
                    arrow.use(prefix, newRoute)
                }
                return route.route(routePath)
                    [method](arrayHandler)
            }
        });
        !_.isEmpty(arrayMethod) && arrow.use(prefix, route);
    });
    return arrow
}
/**
 *
 * @param application
 * @param componentView
 * @param componentName
 * @param component
 * @returns {Function}
 */
function overrideViewRender(application, componentView, componentName, component, key) {
    return function (req, res, next) {
        // Grab reference of render
        req.arrowUrl = key + "." + componentName;

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
/**
 *
 * @param req
 * @param res
 * @param application
 * @param componentView
 * @param componentName
 * @param component
 * @returns {Function}
 */
function makeRender(req, res, application, componentView, componentName, component) {
    return function (view, options, callback) {

        var done = callback;
        var opts = {};

        //remove flash message
        delete req.session.flash;

        // merge res.locals
        _.assign(opts, application.locals);
        _.assign(opts, res.locals);

        // support callback function as second arg
        /* istanbul ignore if */
        if (typeof options === 'function') {
            done = options;
        } else {
            _.assign(opts, options);
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

/**
 *
 * @param obj
 * @param application
 * @param componentName
 * @returns {*}
 */
function handleView(obj, application, componentName) {
    let miniPath = obj.func(application._config, componentName);
    let normalizePath;
    /* istanbul ignore if */
    if (miniPath[0] === path.sep) {
        normalizePath = path.normalize(obj.base + path.sep + miniPath);
    } else {
        normalizePath = path.normalize(obj.fatherBase + path.sep + miniPath)
    }
    return normalizePath
}

/* istanbul ignore next */
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
/**
 *
 * @param application
 * @param permissions
 * @param componentName
 * @param key
 * @returns {handleRoles}
 */
/* istanbul ignore next */
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
/**
 * Load global functions then append to global.ArrowHelper
 * bind global function to ArrowApplication object so dev can this keyword in that function to refer
 * ArrowApplication object
 * @param self: ArrowApplication object
 */
function loadingGlobalFunction(self) {
    global.ArrowHelper = {};
    __.getGlobbedFiles(path.resolve(__dirname, "..", "helpers/*.js")).map(function (link) {
        let arrowObj = require(link);
        Object.keys(arrowObj).map(function (key) {
            /* istanbul ignore else */
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
    global.__ = ArrowHelper.__;
    return self
}


function addRoles(self) {
    self.permissions = {};
    self._componentList.map(function (key) {
        let managerName = key + "Manager";
        self.permissions[key] = self[managerName].getPermissions();
    });
    return self
}

/**
 * Redirect url when meet same error.
 * @param app
 * @returns {*}
 */
function circuit_breaker(app) {
    if (app.getConfig('fault_tolerant.enable')) {
        app.use(function (req, res, next) {
            if (app.arrowErrorLink[req.url]) {
                let redirectLink = app.getConfig('fault_tolerant.redirect');
                redirectLink = _.isString(redirectLink) ? redirectLink : "404";
                res.redirect(path.normalize(path.sep + redirectLink));
            } else {
                next();
            }
        })
    }
    return app
}

/**
 * Handle Error and redirect error
 * @param app
 */
/* istanbul ignore next */
function handleError(app) {
    /** Assume 'not found' in the error msg is a 404.
     * This is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
     */
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        let error = {};
        if (!err) return next();
        if (app.getConfig('fault_tolerant.enable')) {
            app.arrowErrorLink[req.url] = true;
            error[req.url] = {};
            error[req.url].error = err.stack;
            error[req.url].time = Date.now();
            let arrayInfo = app.getConfig('fault_tolerant.logdata');
            if (_.isArray(arrayInfo)) {
                arrayInfo.map(function (key) {
                    error[req.url][key] = req[key];
                })
            }

        } else {
            error.error = err.stack;
            error.time = Date.now();
            let arrayInfo = app.getConfig('fault_tolerant.logdata');
            if (_.isArray(arrayInfo)) {
                arrayInfo.map(function (key) {
                    error[key] = req[key];
                })
            }
        }
        if (app.getConfig('fault_tolerant.log')) {
            logger.error(error);
        }

        let renderSetting = app.getConfig('fault_tolerant.render');
        if (_.isString(renderSetting)) {
            let arrayPart = renderSetting.split(path.sep);
            arrayPart = arrayPart.map(function (key) {
                if (key[0] === ":") {
                    key = key.replace(":", "");
                    return app.getConfig(key);
                } else {
                    return key
                }
            });
            let link = arrayPart.join(path.sep);
            app.render(path.normalize(app.arrFolder + link), {error: error}, function (err, html) {
                if (err) {
                    res.send(err)
                } else {
                    res.send(html)
                }
            });
        } else {
            res.send(error)
        }
    });
    if (app.getConfig("error")) {
        Object.keys(app.getConfig("error")).map(function (link) {
            let errorConfig = app.getConfig("error");
            if (errorConfig[link].render) {
                if (_.isString(errorConfig[link].render)) {
                    app.get(path.normalize(path.sep + link + `(.html)?`), function (req, res) {
                        app.render(errorConfig[link].render, function (err, html) {
                            if (err) {
                                res.send(err.toString())
                            } else {
                                res.send(html)
                            }
                        });
                    })
                } else if (_.isObject(errorConfig[link].render)) {
                    app.get(link, function (req, res) {
                        res.send(errorConfig[link].render)
                    })
                } else if (_.isNumber(errorConfig[link].render)) {
                    app.get(link, function (req, res) {
                        res.sendStatus(errorConfig[link].render)
                    })
                } else {
                    app.get(link, function (req, res) {
                        res.send(link)
                    })
                }
            }

        })
    }

    if (app.getConfig("error")) {
        Object.keys(app.getConfig("error")).map(function (link) {
            let errorConfig = app.getConfig("error");
            if (errorConfig[link] && errorConfig[link].prefix) {
                app.use(errorConfig[link].prefix, function (req, res) {
                    res.redirect(path.normalize(path.sep + link))
                })
            }
        })
    }

    app.use("*", function (req, res) {
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

    return app
}

function getDataByDotNotation(obj, key) {
    if (_.isString(key)) {
        if (key.indexOf(".") > 0) {
            let arrayKey = key.split(".");
            let self = obj;
            let result;
            arrayKey.map(function (name) {
                if (self[name]) {
                    result = self[name];
                    self = result;
                } else {
                    result = null
                }
            });
            return result
        } else {
            return obj[key];
        }
    } else {
        return null
    }
}
/* istanbul ignore next */
function loadSetting(des, source) {
    let baseFolder = this.arrFolder;
    let setting = {};
    let filePath = path.normalize(baseFolder + des);
    try {
        fs.accessSync(filePath);
        _.assign(setting, require(filePath));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsExtra.copySync(path.resolve(source), filePath);
            _.assign(setting, require(filePath));
        } else {
            throw err
        }

    }
    return setting;
}

function addConfig(obj) {
    let config = this._config;
    if (_.isObject(obj)) {
        _.assign(config, obj);
    }
}
/* istanbul ignore next */
function addConfigFile(filename) {
    let app = this;
    let configFile = path.normalize(app.arrFolder + "/" + filename);
    fs.readFile(configFile, 'utf8', function (err, data) {
        if (err) throw err;
        let obj = JSON.parse(data);

        app.updateConfig(obj);
    });
    fs.watch(configFile, function (event, filename) {
        if (event === "change") {
            fs.readFile(configFile, 'utf8', function (err, data) {
                if (err) throw err;
                let obj = JSON.parse(data);

                app.updateConfig(obj);
            });
        }
    })
}

module.exports = ArrowApplication;

