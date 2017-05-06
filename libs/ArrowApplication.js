'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  path = require('path'),
  express = require('express'),
  _ = require('lodash'),
  r = require('nunjucks').runtime,
  fsExtra = require('fs-extra'),
  Promise = require('bluebird'),
  http = require('http'),
  dotenv = require('dotenv'),

  setupManager = require("../utils/setupManager"),
  setupPlugin = require("../utils/setupPlugin"),
  setupRenderLayout = require('../utils/setupRenderLayout'),
  setupWebsocket = require('../utils/setupWebsocket'),
  setupExpress = require('../utils/setupExpress'),
  setupModels = require('../utils/setupModels'),
  setupRoute = require('../utils/setupRoute'),
  setupWinstonLog = require("./../utils/handleLogger").init,

  sortRouter = require('../utils/sortRouter'),
  getCacheConfig = require("../utils/getCacheConfig"),
  getDataByDotNotation = require("../utils/getDataByDotNotation"),
  loadSetting = require('../utils/loadSetting'),
  loadGlobalFunction = require('../utils/loadGlobalFunction'),

  overrideExpress = require('../utils/overrideExpress'),
  getRawPermissions = require('../utils/getRawPermissions'),
  handleError = require('../utils/handleError'),
  connectRedis = require("./connectRedis"),
  logger = require("./../utils/handleLogger"),
  __ = require("./global_function"),
  arrowStack = require('./ArrStack'),
  buildStructure = require("./buildStructure"),
  setupMultiLanguage = require("./i18n").setupMultiLanguage;

/**
 * ArrowApplication is a singleton object. It is heart of Arrowjs.io web app. it wraps Express and adds following functions:
 * support Redis, multi-languages, passport, check permission and socket.io / websocket
 */

class ArrowApplication {
  /**
   *
   * <ul>
   *     <li>passport: true, turn on authentication using Passport module</li>
   *     <li>role: true, turn on permission checking, RBAC</li>
   *     <li>order: true, order router priority rule.</li>
   * </ul>
   * @param settings
   */
  constructor(settings = {}) {
    //if NODE_ENV does not exist, use development by default
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    this.beforeAuth = [];  //add middle-wares before user authenticates
    this.afterAuth = [];   //add middle-ware after user authenticates
    this.plugins = [];   //add arrow plugin after user authenticates
    const app = express();

    global.Arrow = {};

    //Move all functions of express to ArrowApplication
    //So we can call ArrowApplication.listen(port)
    _.assign(this, app);
    this.expressApp = function (req, res, next) {
      this.handle(req, res, next);
    }.bind(this);

    // 0 : location of this file
    // 1 : location of index.js (module file)
    // 2 : location of server.js file
    const requester = arrowStack(2);
    this.arrFolder = path.dirname(requester) + '/';

    //assign current Arrowjs application folder to global variable
    global.__base = this.arrFolder;

    //Read config/config.js into this._config
    require('dotenv').config({path: this.arrFolder + '/config/env' });
    const envConfig = dotenv.parse(fs.readFileSync(`config/env/.env.${process.env.NODE_ENV}`))
    for (let k in envConfig) {
      process.env[k] = envConfig[k]
    }
    this._config = __.getRawConfig();

    //Read and parse config/structure.js
    this.structure = buildStructure(__.getStructure());

    Arrow.logger = setupWinstonLog(this);

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
    this.middleware.i18n = require('i18n');

    //Load available languages. See config/i18n.js and folder /langs
    setupMultiLanguage(this._config);

    //Bind all global functions to ArrowApplication object
    loadGlobalFunction(this);

    //Declare _arrRoutes to store all routes of features
    this._arrRoutes = Object.create(null);

    Arrow.dotChain = getDataByDotNotation;
    Arrow.fs = fsExtra;
    Arrow.loadAndCreate = loadSetting.bind(this);
    Arrow.markSafe = r.markSafe;

    this.arrowSettings = settings;
  }

  /**
   * When user requests an URL, execute this function before server checks in session if user has authenticates
   * If web app does not require authentication, beforeAuthenticate and afterAuthenticate are same. <br>
   * beforeAuthenticate > authenticate > afterAuthenticate
   * @param {function} func - function that executes before authentication
   */
  beforeAuthenticate(func) {
    const self = this;
    return new Promise(function (fulfill, reject) {
      if (_.isFunction(func)) {
        self.beforeAuth.push(func.bind(self));
        return fulfill()
      }
      reject(new Error("Can't beforeAuthenticate: not an function"));
    });
  }

  /**
   * When user requests an URL, execute this function after server checks in session if user has authenticates
   * This function always runs regardless user has authenticated or not
   * @param {function} func - function that executes after authentication
   */
  afterAuthenticate(func) {
    const self = this;
    return new Promise(function (fulfill, reject) {
      if (_.isFunction(func)) {
        self.afterAuth.push(func.bind(self));
        return fulfill()
      }
      reject(new Error("Can't afterAuthenticate: not an function"));
    })
  }

  /**
   * Add plugin function to ArrowApplication.plugins, bind this plugin function to ArrowApplication object
   * @param {function} plugin - plugin function
   * <p><a target="_blank" href="http://www.smashingmagazine.com/2014/01/understanding-javascript-function-prototype-bind/">See more about bind</a></p>
   */
  addPlugin(plugin) {
    const self = this;
    return new Promise(function (fulfill, reject) {
      if (_.isFunction(plugin)) {
        self.plugins.push(plugin.bind(self));
        return fulfill()
      } else {
        reject(new Error("Can't addPlugin: not an Function"));
      }
    })
  }

  /**
   * Kick start express application and listen at default port
   */
  start() {
    let self = this;
    let stackBegin;
    return Promise.resolve()
      .then(() => {
        //Redis connection
        return connectRedis(self._config.redis);
      })
      .then((redisFunction) => {
        //Make redis cache
        self.redisClient = redisFunction(self._config.redis);
        self.redisSubscriber = redisFunction.bind(null, self._config.redis);
      })
      .then(() => {
        return require('./database').connectDB(self)
      })
      .then(() => {
        return setupManager(self)
      })
      .then(() => {
        setupPlugin(self)
      })
      .then(() => {
        getRawPermissions(self);
        return getCacheConfig(self)
      })
      .then(() => {
        //init Express app
        return setupExpress(self)
      })
      .then(() => {
        setupRenderLayout(self)
      })
      .then(() => {
        return setupModels(self);
      })
      .then(() => {
        return overrideExpress(self)
      })
      .then(() => {
        if (self.arrowSettings && self.arrowSettings.order) {
          stackBegin = self._router.stack.length;
        }
        return setupRoute(self);
      })
      .then(() => {
        sortRouter(self, stackBegin);
        return handleError(self)
      })
      .then(() => {
        return http.createServer(self.expressApp);
      })
      .then((server) => {
        self.httpServer = server;
        setupWebsocket(self);

        server.listen(self.getConfig("port"), function () {
          logger.info('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration');
          logger.info('Application started on port ' + self.getConfig("port"), ', Process ID: ' + process.pid);
        });
      })
      .catch((err) => {
        logger.error(err)
      });
  }

  close() {
    const self = this;
    return new Promise(function (fulfill, reject) {
      if (self.httpServer) {
        self.httpServer.close(function (err) {
          if (err) {
            return reject(err)
          }
          fulfill(self.httpServer)
        })
      } else {
        fulfill(self.httpServer)
      }
    })
  }
}

module.exports = ArrowApplication;

