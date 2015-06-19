"use strict"
/**
 * Created by thanhnv on 3/18/15.
 * Modified by trquoccuong on 4/8/15.
 */
var debug = require('debug')("BaseModule"),
    redis = require('redis').createClient(),
    nunjucks = require('nunjucks'),
    fs = require('fs'),
    config = require(__base + 'config/config'),
    _ = require('lodash'),

    ModuleType = {'frontend': 1, 'backend': 2, 'none': 3},
    dirBackend = __base + 'app/backend',
    dirFrontend = __base + 'app/frontend',

    envBackend = __.createNewEnv([dirBackend + '/views_layout', dirBackend + '/modules']),
    envFrontend = __.createNewEnv([dirFrontend + '/themes', dirFrontend + ''])

Object.freeze(ModuleType);


function ArrModule(path, dirname) {
    this.path = "/" + path;
    this.paths = this;
    this.moduleType = (function () {
        if (dirname.indexOf('frontend') !== -1) {
            return ModuleType.frontend;
        } else if (dirname.indexOf('backend') !== -1) {
            return ModuleType.backend;
        } else {
            return ModuleType.none;
        }

    }());

    this.dir = (function () {
        if (this.moduleType) {
            if (this.moduleType === ModuleType.frontend) {
                return dirFrontend
            } else if (this.moduleType === ModuleType.backend) {
                return dirBackend
            }
        }
    }).call(this);

    this.env = (function () {
        if (this.moduleType) {
            if (this.moduleType === ModuleType.frontend) {
                return envFrontend
            } else if (this.moduleType === ModuleType.backend) {
                return envBackend
            }
        }
    }).call(this);
};


ArrModule.prototype.render = function (req, res, view, options, cache) {
    //get messages from session
    var self = this;
    res.locals.messages = req.session.messages;
    //clear session messages
    req.session.messages = [];
    view = makeView(self, view);
    if (cache) {
        var key = req.url.slice(1);
        redis.get(key, function (err, result) {
            if (result) {
                res.send(result);
            } else {
                self.env.render(view, _.assign(res.locals, options), function (err, html) {
                    if (err) {
                        res.send(err.stack);
                    } else {

                        if (!isNaN(cache)) {
                            cache = 180
                        }
                        redis.setex(key, cache, html);
                        res.send(html)
                    }
                });
            }
        })
    } else {
        self.env.render(view, _.assign(res.locals, options), function (err, re) {
            if (err) {
                res.send(err.stack);
            } else {
                res.send(re);
            }
        });
    }
};

ArrModule.prototype.getHTML = function (req, res, view, options, fn) {
    let self = this;
    view = makeView(self, view);
    self.env.render(view, _.assign(res.locals, options), fn);
};

ArrModule.prototype.render_error = function (req, res, view) {
    let self = this;
    //get messages from session
    res.locals.messages = req.session.messages;
    //clear session messages
    req.session.messages = [];
    if (view.indexOf('.html') === -1) {
        view += '.html';
    }
    self.env.loaders[0].searchPaths = [this.dir + '/themes', this.dir + '/themes/' + config.themes];
    self.env.render(view, _.assign(res.locals, options), function (err, re) {
        res.send(re);
    });
};

ArrModule.prototype.render404 = function (req, res) {
    this.render_error(req, res, '404');
};

ArrModule.prototype.render500 = function (req, res) {
    this.render_error(req, res, '500');
};


// SUPPORT FUNCTION


function makeView(mod, view) {
    if (view.indexOf('.html') === -1) {
        view += '.html';
    }

    if (mod.moduleType === ModuleType.frontend) {
        let tmp = config.themes + '/_modules/' + mod.path + '/' + view;
        if (fs.existsSync(__base + 'app/frontend/themes/' + tmp)) {
            mod.env.loaders[0].searchPaths = [mod.dir + '/themes'];
            return config.themes + '/_modules' + mod.path + '/' + view;
        }
        else {
            mod.env.loaders[0].searchPaths = [mod.dir + '/themes', mod.dir + '/modules'];
            if (mod.path.indexOf('/') == 0) {
                return mod.path.substring(1) + '/views/' + view;
            }
            else {
                return mod.path + '/views/' + view;
            }
        }
    } else if (mod.moduleType === ModuleType.backend) {
        return mod.path.substring(1) + '/views/' + view;
    }
}
module.exports = ArrModule;

