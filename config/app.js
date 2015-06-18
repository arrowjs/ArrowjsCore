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
    config = require('./config'),
    redis = require("redis").createClient(),
    RedisStore = require('connect-redis')(session),
    nunjucks = require('nunjucks'),
    _ = require('lodash'),
    path = require('path'),
    Promise = require('bluebird');

module.exports = function () {
    // Initialize express app
    let app = express();

    // Setting the app router and static folder. Should be placed before express.static
    /*app.use(compress({
     filter: function (req, res) {
     return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
     },
     level: 9
     }));*/

    app.use(express.static(path.resolve('./public'), {maxAge: 3600}));

    redis.get(config.redis_prefix + config.key, function (err, result) {
        if (result != null) {
            let tmp = JSON.parse(result);
            _.assign(config, tmp);

        } else {
            redis.set(config.redis_prefix + config.key, JSON.stringify(config), redis.print);
        }

        // Set local variable
        app.locals.title = config.app.title;
        app.locals.description = config.app.description;
        app.locals.keywords = config.app.keywords;
        app.locals.facebookAppId = config.facebook.clientID;
    });

    // Showing stack errors
    app.set('showStackError', true);

    // Set nunjucks as the template engine
    let e = nunjucks.configure(__base + 'app/themes', {
        autoescape: true,
        express: app
    });

    //Initials custom filter
    __.getAllCustomFilter(e);

    // Set views path and view engine
    app.set('view engine', 'html');

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // Enable logger (morgan)
        //app.use(morgan('dev'));

        // Disable views cache
        app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '5mb'
    }));
    app.use(bodyParser.json({limit: '5mb'}));
    app.use(methodOverride());

    // CookieParser should be above session
    app.use(cookieParser());


    // Express session storage
    let secret = "hjjhdsu465aklsdjfhasdasdf342ehsf09kljlasdf";
    let middleSession = session({
        store: new RedisStore({host: config.redis.host, port: config.redis.port, client: redis}),
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

    // Use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // Flash messages
    app.use(require(__base + 'app/middleware/flash-plugin.js'));

    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    // Passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        res.locals.route = req.url;
        res.locals.path = req.protocol + '://' + req.headers.host;

        // HTTP headers for caching static resources
        if (req.user) {
            res.locals.__user = req.user;
        }
        next();
    });

    // Globbing admin module files
    redis.get(config.redis_prefix + 'all_modules', function (err, results) {
        if (results != null) {
            global.__modules = JSON.parse(results);
        } else {
            config.getGlobbedFiles('./app/backend/modules/*/module.js').forEach(function (routePath) {
                require(path.resolve(routePath))(__modules);
            });
            redis.set(config.redis_prefix + 'all_modules', JSON.stringify(__modules), redis.print);
        }
    });

    // Module manager backend
    require(__base + 'app/backend/core_route')(app);
    app.use('/admin/*', require('../app/middleware/modules-plugin.js'));

    // Globbing routing admin files
    config.getGlobbedFiles('./app/backend/modules/*/route.js').forEach(function (routePath) {
        app.use('/' + config.admin_prefix, require(path.resolve(routePath)));
    });

    // Globbing routing admin files
    config.getGlobbedFiles('./app/frontend/modules/*/settings/*.js').forEach(function (routePath) {
        __setting_menu_module.push(require(path.resolve(routePath))(app, config));
    });

    // Globbing routing admin files
    config.getGlobbedFiles('./app/frontend/modules/*/settings/*.js').forEach(function (routePath) {
        require(path.resolve(routePath))(app, config);
    });

    app.use('/admin/*', function (req, res, next) {
        if (!req.isAuthenticated()) {
            console.log("redirect to admin login");
            return res.redirect('/admin/login');
        }
        next();
    });

    // Module manager frontend
    app.use('/*', require('../app/middleware/modules-f-plugin.js'));

    // Globbing frontend module files
    config.getGlobbedFiles('./app/frontend/modules/*/module.js').forEach(function (routePath) {
        require(path.resolve(routePath))(__f_modules);
    });

    // Globbing routing files
    require(__base + 'app/frontend/modules/routes')(app);

    // Globbing menu files
    config.getGlobbedFiles('./app/menus/*/*.js').forEach(function (routePath) {
        console.log(routePath);
        require(path.resolve(routePath))(__menus);
    });

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();

        // Log it
        console.error(err.stack);

        // Log error into database
        __models.logs.create({
            event_name: err.name,
            message: err.stack,
            type: 0 // warning or error
        });

        // Error page
        res.status(500).render('500', {
            error: err.stack
        });
    });

    // Assume 404 since no middleware responded
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

    if (process.env.NODE_ENV === 'secure') {
        // Log SSL usage
        console.log('Securely using https protocol');

        // Load SSL key and certificate
        let privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
        let certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

        // Create HTTPS Server
        let httpsServer = https.createServer({
            key: privateKey,
            cert: certificate
        }, app);

        // Return HTTPS server instance
        return httpsServer;
    }

    // Return Express server instance
    return app;
};
