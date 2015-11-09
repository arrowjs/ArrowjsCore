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
        this.arrFolder = path.dirname(requester) + '/';


        global.__base = this.arrFolder;
        this._config = __.getRawConfig();  //Read config/config.js into this._config
        //let structure = __.getStructure();
        this.structure = buildStructure(__.getStructure());

        //this.arrlog = SystemLog;

        //Make redis cache
        let redisConfig = this._config.redis || {};
        let redisFunction = RedisCache(redisConfig);
        var redisClient,redisSubscriber;

        if(redisConfig.type === "fakeredis"){
            redisClient = redisFunction("client");
            redisSubscriber = redisFunction.bind(null,redisConfig);
        } else {
            redisClient = redisFunction(redisConfig);
            redisSubscriber = redisFunction.bind(null,redisConfig);
        }

        this.redisClient = redisClient;
        this.redisSubscriber =  redisSubscriber;

        //TODO: why we assign many properties of ArrowApplication to _expressApplication. It is redundant
        this._expressApplication.arrFolder = this.arrFolder;
        this._expressApplication.arrConfig = this._config;
        this._expressApplication.redisCache = this.redisCache;
        this._expressApplication.usePassport = require("./loadPassport");
        this._expressApplication.useFlashMessage = require("./flashMessage");
        this._expressApplication.useSession = require("./useSession");

        this._componentList = [];

        this.configManager = new ConfigManager(this,"config");
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
            this[managerName] = new DefaultManager(this,key);
            this[managerName].eventHook(eventEmitter);
            this[managerName].loadComponents(key);
            this[key] = this[managerName]["_" + key];
            this._componentList.push(key);
        }.bind(this));
    }

    addModule(modulePath) {
        if (path.isAbsolute(modulePath)) {
            if (fs.existsFile(modulePath + '/module.js')) {
                this.modules.push(modulePath);
            } else {
                logger.error(modulePath + 'is not Arrow module!');
            }
        }
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
                loadRouteAndRender(self)
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
        Object.keys(arrow[key]).map(function (component) {
            let routeConfig = arrow[key][component]._structure.route;
            if (routeConfig) {
                Object.keys(routeConfig.path).map(function (second_key) {
                    if (arrow[key][component].routes[second_key]) {
                        //need testing this problems
                        if (routeConfig.path[second_key].prefix) {
                            arrow.use(routeConfig.path[second_key].prefix, overrideViewRender(arrow, arrow[key][component].views,second_key), arrow[key][component].routes[second_key]);
                        } else {
                            arrow.use("/", overrideViewRender(arrow, arrow[key][component].views,second_key), arrow[key][component].routes[second_key]);
                        }
                    } else {
                        if (routeConfig.path[second_key].prefix) {
                            arrow.use(routeConfig.path[second_key].prefix, overrideViewRender(arrow, arrow[key][component].views), arrow[key][component].routes);
                        } else {
                            arrow.use("/", overrideViewRender(arrow, arrow[key][component].views), arrow[key][component].routes);
                        }
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

function overrideViewRender(application, componentView, key) {
    return function (req, res, next) {
        // Grab reference of render
        let _render = res.render;

        // Override logic
        res.render = function (view, options, callback) {
            var done = callback;
            var opts = options || {};
            var req = this.req;
            var self = this;


            // support callback function as second arg
            if (typeof options === 'function') {
                done = options;
                opts = {};
            }

            // merge res.locals
            opts._locals = self.locals;

            // default callback to respond
            done = done || function (err, str) {
                if (err) return req.next(err);
                self.send(str);
            };

            if (application._config.viewExtension && view.indexOf(application._config.viewExtension) === -1) {
                view += "." + application._config.viewExtension;
            }

            application.viewTemplateEngine.loaders[0].pathsToNames = {};
            application.viewTemplateEngine.loaders[0].cache = {};
            if(key) {
                application.viewTemplateEngine.loaders[0].searchPaths = componentView[key].map(function (obj) {
                    return handleView(obj, application);
                });
            }else {
                application.viewTemplateEngine.loaders[0].searchPaths = componentView.map(function (obj) {
                    return handleView(obj, application);
                });
            }


            application.viewTemplateEngine.render(view, options, done)

        };
        next();
    }
}

function handleView(obj, application) {
    let miniPath = obj.func(application._config);
    let normalizePath;
    if (miniPath[0] === "/") {
        normalizePath = path.normalize(obj.base + "/" + miniPath);
    } else {
        normalizePath = path.normalize(obj.fatherBase + "/" + miniPath)
    }
    return normalizePath
}
module.exports = ArrowApplication;