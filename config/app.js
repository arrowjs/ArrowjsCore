'use strict';

/**
 * Module dependencies.
 */
let fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    redis = require("redis").createClient(),
    RedisStore = require('connect-redis')(session),
    nunjucks = require('nunjucks'),
    _ = require('lodash'),
    path = require('path'),
    Promise = require('bluebird');

module.exports = function () {
    /** Initialize express app */
    let app = express();

    /** Uncomment to setting the app router and static folder. Should be placed before express.static */
    //app.use(compress({
    //    filter: function (req, res) {
    //        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    //    },
    //    level: 9
    //}));

    /** Set static resources path */
    app.use(express.static(path.resolve('./public'), {maxAge: 3600}));

    //todo: hoi anh thanh
    redis.get(__config.redis_prefix + __config.key, function (err, result) {
        if (result != null) {
            let tmp = JSON.parse(result);
            _.assign(__config, tmp);
        } else {
            redis.set(__config.redis_prefix + __config.key, JSON.stringify(__config), redis.print);
        }

        // Set local variable
        app.locals.title = __config.app.title;
        app.locals.description = __config.app.description;
        app.locals.keywords = __config.app.keywords;
        app.locals.facebookAppId = __config.facebook.clientID;
    });

    /** Showing stack errors */
    app.set('showStackError', true);

    /** Set nunjucks as the template engine */
    let e = nunjucks.configure(__base + 'app/themes', {
        autoescape: true,
        express: app
    });

    /** Set views path and view engine */
    app.set('view engine', 'html');

    // Initials custom filter
    //todo: create env moi lai phai add lai custom filter?
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
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '5mb'
    }));
    app.use(bodyParser.json({limit: '5mb'}));
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
    app.use(passport.initialize());
    app.use(passport.session());

    /** Flash messages */
    app.use(require(__base + 'core/middleware/flash-plugin.js'));

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

    /** Store module status (active|unactive) in Redis */
    redis.get(__config.redis_prefix + 'all_modules', function (err, results) {
        if (results != null) {
            global.__modules = JSON.parse(results);
        } else {
            let adminModules = __config.getOverrideCorePath(__base + 'core/modules/*/module.js', __base + 'app/modules/*/module.js', 2);
            for (let index in adminModules) {
                if (adminModules.hasOwnProperty(index)) {
                    require(path.resolve(adminModules[index]))(__modules);
                }
            }

            redis.set(__config.redis_prefix + 'all_modules', JSON.stringify(__modules), redis.print);
        }
    });

    /** Module manager */
    require(__base + 'core_route')(app);
    app.use('/' + __config.admin_prefix + '/*', require('../core/middleware/modules-plugin.js'));

    /** Globbing backend route files */
    let adminRoute = __config.getOverrideCorePath(__base + 'core/modules/*/backend/route.js', __base + 'app/modules/*/backend/route.js', 3);
    for (let index in adminRoute) {
        if (adminRoute.hasOwnProperty(index)) {
            app.use('/' + __config.admin_prefix, require(path.resolve(adminRoute[index])));
        }
    }

    /** Check authenticate in backend */
    app.use('/' + __config.admin_prefix + '/*', function (req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/' + __config.admin_prefix + '/login');
        }
        next();
    });

    /** Globbing route frontend files */
    let frontRoute = __config.getOverrideCorePath(__base + 'core/modules/*/frontend/route.js', __base + 'app/modules/*/frontend/route.js', 3);
    for (let index in frontRoute) {
        if (frontRoute.hasOwnProperty(index)) {
            require(path.resolve(frontRoute[index]))(app);
        }
    }

    // Globbing menu files
    //todo: xu ly menu backend va frontend chung
    __config.getGlobbedFiles('./menus/*/*.js').forEach(function (routePath) {
        require(path.resolve(routePath))(__menus);
    });

    /** Assume 'not found' in the error msgs is a 404.
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
                res.redirect('/404.html');
            } else {
                res.sendStatus(404);
            }
        } catch (err) {
            res.sendStatus(404);
        }
    });

    /** Return Express server instance */
    return app;
};
