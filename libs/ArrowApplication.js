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
    SystemLog = require("./SystemLog"),
    utils = require("./utils"),
    __ = require("./global_function"),
    EventEmitter = require('events').EventEmitter,
    DefaultManager = require("../manager/DefaultManager"),
    ConfigManager = require("../manager/ConfigManager"),
    buildStructure = require("./buildStructure"),
    ViewEngine = require("../libs/ViewEngine");


let coreEvent = new EventEmitter();

class ArrowApplication {
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
        this._config = __.getRawConfig();
        let structure = __.getStructure();
        this.structure = buildStructure(structure);


        //TODO: Cuong Tran, will this better way to use Winston Log?
        //http://thottingal.in/blog/2014/04/06/winston-nodejs-logging/
        this.arrlog = SystemLog;

        //Make redis cache
        let redisConfig = this._config.redis || {};
        let redisFunction = RedisCache(redisConfig);
        this.RedisCache = redisFunction.bind(null, redisConfig);
        this.redisCache = redisFunction(redisConfig);
        this._expressApplication.arrFolder = this.arrFolder;
        this._expressApplication.arrConfig = this._config;
        this._expressApplication.redisCache = this.redisCache;
        this._expressApplication.usePassport = require("./loadPassport");
        this._expressApplication.useFlashMessage = require("./flashMessage");
        this._expressApplication.useSession = require("./useSession");

        this._componentList = [];

        this.configManager = new ConfigManager(this);
        this.configManager.eventHook(eventEmitter);
        this._config = this.configManager._config;

        let componentsRender = ViewEngine(this.arrFolder);
        this.viewTemplateEngine = componentsRender;
        Object.keys(this.structure).map(function (managerKey) {
            let key = managerKey;
            let managerName = managerKey + "Manager";
            this[managerName] = new DefaultManager(this);
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
                console.log(modulePath + 'is not Arrow module!');
            }
        }
    }

    start() {
        let self = this;
        let exApp = self._expressApplication;
        let resolve = Promise.resolve();
        /** Init the express application */
        return resolve
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
                loadRoute(self)
            })
            .then(function (app) {
                exApp.listen(self._config.port, function () {
                    console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
                    console.log('Application started on port ' + self._config.port, ', Process ID: ' + process.pid);
                });
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
 * Load Route
 */
function loadRoute(arrow) {
    arrow._componentList.map(function (key) {
        Object.keys(arrow[key]).map(function (component) {
            let routeConfig = arrow[key][component]._structure.route;
            if (routeConfig) {
                if (_.isArray(routeConfig)) {
                    Object.keys(routeConfig.path).map(function (com_key) {
                        if (arrow[key][component].routes[com_key]) {
                            if (routeConfig.path[com_key].prefix) {
                                arrow.use(routeConfig.path[com_key].prefix, arrow[key][component].routes[com_key]);
                            } else {
                                arrow.use("/", arrow[key][component].routes[com_key]);
                            }
                        }
                    })
                } else {
                    if (arrow[key][component].routes) {
                        if (routeConfig.prefix) {
                            arrow.use(routeConfig.prefix, arrow[key][component].routes);
                        } else {
                            arrow.use("/", arrow[key][component].routes);
                        }
                    }
                }
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

module.exports = ArrowApplication;