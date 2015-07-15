'use strict'
/**
 * Module dependencies.
 */
let fs = require('fs'),
    http = require('http'),
    https = require('https'),
    callsite = require('callsite'),
    path = require('path'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    nunjucks = require('nunjucks'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    libFolder = __dirname;
let session = require('express-session'),
    redis = require("redis").createClient(),
    RedisStore = require('connect-redis')(session);


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

        /**
         * Main application entry file.
         * Please note that the order of loading is important.
         */

        global.__config = require(libFolder + '/config_manager.js');
        global.__ = require(libFolder + '/global_function');
        global.__lang = require(libFolder + '/i18n.js')();
        global.__dateformatter = require(libFolder + '/dateformatter');
        global.__acl = require(libFolder + '/acl');
        global.__models = require(libFolder + '/models_manager');
        global.__pluginManager = require(libFolder + '/plugins_manager');
        global.__menus = require(libFolder + '/menus_manager')();
        global.__menuManager = require(libFolder + '/menus_manager');
        global.__modules = require(libFolder + '/modules_manager')();
        global.__moduleManager = require(libFolder + '/modules_manager');
        global.__cache = require(libFolder + '/arr_caching')();
        global.__event = require(libFolder + '/event_manager');
        global.__widget = require(libFolder + '/widgets_manager');
        global.__messages = [];
        global.__setting_menu_module = [];
        global.BackModule = require(libFolder + '/BackModule');
        global.BaseWidget = require(libFolder + '/BaseWidget');
        global.FrontModule = require(libFolder + '/FrontModule');
        /** Init widgets */
        require(libFolder + '/widgets_manager')();

        /** Init plugins */
        __pluginManager.loadAllPlugins();

        /** Create app dir if not exist */
        __utils.createDirectory('app');
        __utils.createDirectory('app/custom_filters');
        __utils.createDirectory('app/modules');
        __utils.createDirectory('app/plugins');
        __utils.createDirectory('app/widgets');

        /** Bootstrap passport config */
        if (fs.existsSync(__base + 'config/passport.js')) {
            require(__base + 'config/passport.js')(passport);
        }
        /** Init the express application */
        makeApp(this.appEx, this.beforeFunction);
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
     *    Set local variable
     */

    app.locals.title = __config.app.title;
    app.locals.description = __config.app.description;
    app.locals.keywords = __config.app.keywords;
    app.locals.facebookAppId = __config.facebook.clientID || "";

    /** Showing stack errors */
    app.set('showStackError', true);

    /** Set nunjucks as the template engine */
    let e = nunjucks.configure(__base + 'app/themes', {
        autoescape: true,
        express: app
    });

    /** Set views path and view engine */
    app.set('view engine', 'html');

    /** Initials custom filter */
    __.getAllCustomFilter(e);

    /** Environment dependent middleware */
    if (process.env.NODE_ENV === 'development') {
        /** Uncomment to enable logger (morgan) */
        //app.use(morgan('dev'));

        /** Disable views cache */
        app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    } else if (process.env.NODE_ENV === 'secure') {
        /** Log SSL usage */
        console.log('Securely using https protocol');

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
    let secret = "hjjhdsu465aklsdjfhasdasdf342ehsf09kljlasdf";
    let middleSession = session({
        store: new RedisStore({host: __config.redis.host, port: __config.redis.port, client: redis}),
        secret: secret,
        key: 'sid',
        resave: true,
        saveUninitialized: true
    });
    app.use(middleSession);
    app.use(function (req, res, next) {
        if (!req.session) {
            return next(new Error('Session destroy')); // handle error
        }
        next(); // otherwise continue
    });


    /** Use passport session */
    if (fs.existsSync(__base + 'config/passport.js')) {
        app.use(passport.initialize());
        app.use(passport.session());
    }
    /** Flash messages */
    app.use(require(path.resolve(libFolder, '..', 'middleware/flash-plugin.js')));

    /** Use helmet to secure Express headers */
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    /** Passing the request url to environment locals */
    app.use(function (req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        res.locals.path = req.protocol + '://' + req.headers.host;
        res.locals.route = req.url;

        if (req.user) {
            res.locals.__user = req.user;
        }
        next();
    });
    ///** Store module status (active|unactive) in Redis */
    let md = require(libFolder + '/modules_manager.js');
    redis.get(__config.redis_prefix + 'all_modules', function (err, results) {
        if (results != null) {
            global.__modules = JSON.parse(results);
            md.makeMenu(__modules);
        } else {
            md.loadAllModules();
        }
        let menus = __cache.get(__config.redis_prefix + 'backend_menus')
        if (menus != null) global.__menus = JSON.parse(menus);
        else console.log('Backend menus is not defined!!!');
    });
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

    // Globbing routing admin files
    __.getGlobbedFiles(__base +'app/frontend/modules/*/settings/*.js').forEach(function (routePath) {
        __setting_menu_module.push(require(path.resolve(routePath))(app, __config));
    });

    /** Globbing route frontend files */

    //for(let i in __modules) {
    //    if(__modules.hasOwnProperty(i)){
    //        if (__modules[i].system || __modules[i].active) {
    //            let myRoute = __modules[i].frontRoute;
    //            if(myRoute) {
    //                if (myRoute.name === 'router') {
    //                    app.use('/', myRoute);
    //                } else {
    //                    myRoute(app);
    //                }
    //
    //            }
    //        }
    //    }
    //}
    //
    let frontRoute = __.getOverrideCorePath(__base + 'core/modules/*/frontend/route.js', __base + 'app/modules/*/frontend/route.js', 3);
    var frontPath = []
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
    })
    let coreModule = new FrontModule;
    app.get('/404', function (req,res) {
        coreModule.render404(req,res);
    })
    return app
};

module.exports = ArrowApplication;