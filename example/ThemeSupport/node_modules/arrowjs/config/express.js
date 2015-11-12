"use strict";

let bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    express = require('express'),
    path = require('path'),
    morgan = require('morgan'),
    fs = require('fs'),
    helmet = require('helmet'),
    cookieParser = require('cookie-parser'),
    arrowStack = require('../libs/ArrStack').stack;


module.exports = function (app) {
    /**
     * Set folder static resource
     */
    app.use(express.static(path.resolve(app.arrFolder + app.arrConfig.resource.path), app.arrConfig.resource.option));

    /**
     * Set local variable
     */
    app.locals.title = app.arrConfig.app.title;
    app.locals.description = app.arrConfig.app.description;
    app.locals.keywords = app.arrConfig.app.keywords;
    app.locals.facebookAppId = app.arrConfig.facebook.clientID || "";

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

    app.use(bodyParser.urlencoded(app.arrConfig.bodyParser));
    app.use(bodyParser.json({limit: app.arrConfig.bodyParser.limit}));
    app.use(methodOverride());

    /** CookieParser should be above session */
    app.use(cookieParser());

    /** Express session storage */

    //app.useSession();

    /** Use passport session */

    //app.usePassport();

    /** Flash messages */

    //app.useFlashMessage();

    /** Use helmet to secure Express headers */
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    /** Passing the variables to environment locals */
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