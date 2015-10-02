'use strict';

/**
 * Module dependencies.
 */
let fs = require('fs'),
    https = require('https'),
    callsite = require('callsite'),
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
    smtpPool = require('nodemailer-smtp-pool'),
    pluginManager = require('./plugins_manager');

class ArrowApplication {
    constructor() {
        this.modules = [];
        this.beforeFunction = [];
        this.appEx = express();
        let self = this.appEx
        for (let func in self) {
            if (typeof self[func] == 'function') {
                this[func] = self[func].bind(self);
            } else {
                this[func] = self[func]
            }
        }

        let stack = callsite();
        let requester = stack[1].getFileName();

        global.__base = path.dirname(requester) + '/';
        global.__ = require(libFolder + '/global_function');
        global.__utils = require(libFolder + '/utils');
        global.BackModule = require(libFolder + '/BackModule');
        global.BaseWidget = require(libFolder + '/BaseWidget');
        global.FrontModule = require(libFolder + '/FrontModule');
        global.__cache = require(libFolder + '/arr_caching')();
        require(libFolder + '/config_manager.js')().then(function () {
            /** Init widgets */
            require(libFolder + '/widgets_manager')();
        });
        global.__mailSender = mailer.createTransport(smtpPool(__config.mailer_config));

        global.__models = require(libFolder + '/models_manager');
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
        var self = this
        /**
         * Main application entry file.
         * Please note that the order of loading is important.
         */
        global.__ = require(libFolder + '/global_function');
        global.__lang = require(libFolder + '/i18n.js')();
        global.__dateformatter = require(libFolder + '/dateformatter');
        global.__acl = require(libFolder + '/acl');
        global.__menus = {};
        global.__modules = {};
        global.__setting_menu_module = [];



        /** Init plugins */
        pluginManager.loadAllPlugins();

        /** Create app dir if not exist */
        __utils.createDirectory('app');
        __utils.createDirectory('app/custom_filters');
        __utils.createDirectory('app/modules');
        __utils.createDirectory('app/plugins');
        __utils.createDirectory('app/widgets');

        /** Init the express application */
        return new Promise(function (fulfill,reject) {
            makeApp(self.appEx, self.beforeFunction).then(function (app) {
                console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
                fulfill(app)
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
function makeApp(app, beforeFunc) {
    app.use(express.static(path.resolve(__base + __config.resource.path), __config.resource.option));

    /**
     * Set local variable
     */
    app.locals.title = __config.app.title;
    app.locals.description = __config.app.description;
    app.locals.keywords = __config.app.keywords;
    app.locals.facebookAppId = __config.facebook.clientID || "";

    /** Showing stack errors */
    app.set('showStackError', true);

    /** Set views path and view engine */
    app.set('view engine', 'html');


    /** Environment dependent middleware */
    if (process.env.NODE_ENV === 'development') {
        /** Uncomment to enable logger (morgan) */
        app.use(morgan('dev'));
        /** Disable views cache */
        app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    } else if (process.env.NODE_ENV === 'secure') {
        /** Log SSL usage */

        /** Load SSL key and certificate */
        let privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
        let certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

        /** Create HTTPS Server */
        let httpsServer = https.createServer({
            key: privateKey,
            cert: certificate
        }, app);

        /** Return HTTPS server instance */
        return httpsServer;
    }

    /** Request body parsing middleware should be above methodOverride */
    app.use(bodyParser.urlencoded(__config.bodyParser));
    app.use(bodyParser.json({limit: __config.bodyParser.limit}));
    app.use(methodOverride());

    /** CookieParser should be above session */
    app.use(cookieParser());

    /** Express session storage */
    app.use(require(__base + 'config/session'));

    app.use(function (req, res, next) {

        if (!req.session) {
            return next(new Error('Session destroy')); // handle error
        }
        next(); // otherwise continue
    });

    /** Use passport session */

    if (!fs.accessSync(__base + 'config/passport.js')) {
        // Initialize strategies
        __.getGlobbedFiles(__base + 'config/strategies/**/*.js').forEach(function (strategy) {
            require(path.resolve(strategy))();
        });
        require(__base + 'config/passport.js')(passport);

        app.use(passport.initialize());
        app.use(passport.session());
    }


    /** Flash messages */

    app.use(require('../middleware/flash-plugin.js'));

    //app.use(require('../middleware/global_loading'));


    /** Use helmet to secure Express headers */
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    /** Passing the request url to environment locals */
    app.use(function (req, res, next) {
        res.locals.hasOwnProperty = Object.hasOwnProperty
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        res.locals.path = req.protocol + '://' + req.headers.host;
        res.locals.route = req.url;

        if (req.user) {
            res.locals.__user = req.user;
        }
        next();
    });
    /** Store module status (active|unactive) in Redis */
    //redis.get(__config.redis_prefix + 'backend_menus', function (err, result) {
    //    if (result != null) {
    //        global.__menus = JSON.parse(result);
    //    } else {
    //        console.log('Backend menus is not defined!!!');
    //    }
    //    console.log('ending load backend Menu');
    //
    //});
    //console.log('starting load  module');
    return new Promise(function (fulfill,reject) {
        loadMenuAndModule().then(function () {
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
    })


    //redis.get(__config.redis_prefix + 'all_modules', function (error, results) {
    //    if (results != null) {
    //        global.__modules = JSON.parse(results);
    //    } else {
    //        md.loadAllModules();
    //    }
    //    let menus = __cache.get(__config.redis_prefix + 'backend_menus').then(function (menus) {
    //        if (menus != null) global.__menus = JSON.parse(menus);
    //        else console.log('Backend menus is not defined!!!');
    //    });
    //
    //});
}

function loadMenuAndModule() {
    let md = require(libFolder + '/modules_manager.js');

    let mn = require(libFolder + '/menus_manager.js');

    return new Promise(function (fulfill,reject) {
        return mn().then(function (menus) {
            global.__menus = menus;
            return md().then(function (modules) {
                if(Object.keys(modules).length === 0) {
                    return md.loadAllModules().then(function() {
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

module.exports = ArrowApplication;