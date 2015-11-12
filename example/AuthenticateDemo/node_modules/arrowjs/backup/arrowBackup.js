/**
 *
 * @param app
 */
function loadRouteBackend(app) {

    /** Check module active/system in backend */

    app.use('/' + app._appConfig.admin_prefix + '/*', require('../middleware/modules-plugin.js'));

    /** Globbing backend route files */
    let adminRoute = __.getOverrideCorePath(__base + 'core/modules/*/backend/route.js', __base + 'app/modules/*/backend/route.js', 3);
    for (let index in adminRoute) {
        if (adminRoute.hasOwnProperty(index)) {
            let myRoute = require(path.resolve(adminRoute[index]));
            if (myRoute.name === 'router') {
                app.use('/' + app._appConfig.admin_prefix, myRoute);
            } else {
                myRoute(app);
            }
        }
    }
}
/**
 *
 * @param app
 */
function loadSettingMenu(app) {
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
}
/**
 *
 * @param app
 */
function loadRouteFrontend(app) {
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
}
/**
 *
 * @param app
 */
function handleError(app) {
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
}

/**
 * Create app dir if not exist
 */
function makeFolder() {
    utils.createDirectory('app');
    utils.createDirectory('app/custom_filters');
    utils.createDirectory('app/modules');
    utils.createDirectory('app/plugins');
    utils.createDirectory('app/widgets');
    utils.createDirectory('app/middleware');

    utils.createDirectory('core');
    utils.createDirectory('core/custom_filters');
    utils.createDirectory('core/modules');
    utils.createDirectory('core/plugins');
    utils.createDirectory('core/widgets');
}

/**
 *
 * @param arrowApp
 * @returns {boolean}
 */
function makeGlobalVariables(arrowApp) {
    global.__acl = require('./acl');
    global.__services = arrowApp.services;
    global.__configManager = arrowApp.configManager;
    global.__config = arrowApp._config;
    global.__widget = arrowApp.widgets;
    global.__models = arrowApp.models;
    global.__modules = arrowApp.modules;
    global.__menus = arrowApp.menus;
    global.__setting_menu_module = [];
    global.__mailSender = mailer.createTransport(smtpPool(__config.mailer_config));
    return true
}