"use strict";

/**
 * Setting for express
 * @param app
 * @param config : config file
 * @param setting : user setting
 * @returns {*}
 */

module.exports = function (app, config, setting) {

  /**
   * Set folder static resource
   */
  app.middleware.serveStatic();

  /**
   * Set local variable
   */
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.keywords = config.app.keywords;

  /** Showing stack errors */
  app.set('showStackError', true);

  /** Environment dependent middleware */
  if (process.env.NODE_ENV === 'development') {
    /** Uncomment to enable logger (morgan) */
    app.use(app.middleware.morgan('dev'));
    /** Disable views cache */
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  app.use(app.middleware.bodyParser.urlencoded({extended: false}));
  app.use(app.middleware.bodyParser.json());
  app.use(app.middleware.methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      const method = req.body._method
      delete req.body._method
      return method
    }
  }));

  /** CookieParser should be above session */
  app.use(app.middleware.cookieParser());

  app.use(app.middleware.i18n.init);

  /** Express session storage */
  app.middleware.session();

  /** Use passport session */
  app.middleware.passport(setting);

  /** Flash messages */
  app.middleware.flashMessage();

  /** Use helmet to secure Express headers */
  app.use(app.middleware.helmet())
  app.disable('x-powered-by');

  /** Passing the variables to environment locals */
  app.use(function (req, res, next) {
    //res.locals.hasOwnProperty = Object.hasOwnProperty;
    res.locals.url = req.protocol + '://' + req.headers.host + req.url;
    res.locals.path = req.protocol + '://' + req.headers.host;
    res.locals.route = req.url;

    next();
  });

  return app;
};