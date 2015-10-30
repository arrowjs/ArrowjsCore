"use strict";

let bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    __ = require("arrowjs").globalFunction;



module.exports = function (app) {
    /**
     * Set folder static resource
     */
    app.use(express.static(path.resolve(app.baseFolder + app._appConfig.resource.path), app._appConfig.resource.option));

    /**
     * Set local variable
     */
    app.locals.title = app._appConfig.app.title;
    app.locals.description = app._appConfig.app.description;
    app.locals.keywords = app._appConfig.app.keywords;
    app.locals.facebookAppId = app._appConfig.facebook.clientID || "";

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
    }

    app.use(bodyParser.urlencoded(app._appConfig.bodyParser));
    app.use(bodyParser.json({limit: app._appConfig.bodyParser.limit}));
    app.use(methodOverride());

    /** CookieParser should be above session */
    app.use(cookieParser());

    /** Express session storage */
    app.use(require(app.baseFolder + 'config/session'));

    app.use(function (req, res, next) {

        if (!req.session) {
            return next(new Error('Session destroy')); // handle error
        }
        next(); // otherwise continue
    });

    /** Use passport session */

    if (!fs.accessSync(app.baseFolder + 'config/passport.js')) {
        // Initialize strategies
        __.getGlobbedFiles(app.baseFolder + 'config/strategies/**/*.js').forEach(function (strategy) {
            require(path.resolve(strategy))();
        });
        require(__base + 'config/passport.js')(passport);

        app.use(passport.initialize());
        app.use(passport.session());
    }


    /** Flash messages */

    app.use(require(app.baseFolder + '/middleware/flash-plugin.js'));

    /** Use helmet to secure Express headers */
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    /** Passing the request url to environment locals */
    app.use(function (req, res, next) {
        res.locals.hasOwnProperty = Object.hasOwnProperty;
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        res.locals.path = req.protocol + '://' + req.headers.host;
        res.locals.route = req.url;

        if (req.user) {
            res.locals.__user = req.user;
        }
        next();
    });

    return app;
};