"use strict";

var debug = require('debug')("BaseModule Front End"),
    nunjucks = require('nunjucks'),
    fs = require('fs'),
    _ = require('lodash'),
    env = __.createNewEnv([__dirname + '/themes', __dirname + '']);

function BaseModule() {
    this.render = function (req, res, view, options, fn) {
        let self = this;

        // Get messages from session
        res.locals.messages = req.session.messages;

        // Clear session messages
        req.session.messages = [];
        if (view.indexOf('.html') == -1) {
            view += '.html';
        }

        let tmp = __config.themes + '/_modules/' + self.path + '/' + view;
        if (fs.existsSync(__base + 'app/frontend/themes/' + tmp)) {
            env.loaders[0].searchPaths = [__dirname + '/themes'];
            view = __config.themes + '/_modules' + self.path + '/' + view;
        } else {
            env.loaders[0].searchPaths = [__dirname + '/themes', __dirname + '/modules'];
            if (self.path.indexOf('/') == 0) {
                view = self.path.substring(1) + '/views/' + view;
            }
            else {
                view = self.path + '/views/' + view;
            }
        }

        if (fn) {
            env.render(view, _.assign(res.locals, options), fn);
        } else {
            env.render(view, _.assign(res.locals, options), function (err, re) {
                if (err) {
                    res.send(err.stack);
                }
                res.send(re);
            });
        }
    };

    let render_error = function (req, res, view) {
        // Get messages from session
        res.locals.messages = req.session.messages;

        // Clear session messages
        req.session.messages = [];
        if (view.indexOf('.html') == -1) {
            view += '.html';
        }

        env.loaders[0].searchPaths = [__dirname + '/themes', __dirname + '/themes/' + __config.themes];
        //env.render(view, _.assign(res.locals, options), function (err, re) {
        env.render(view, function (err, re) {
            res.send(re);
        });
    };

    this.render404 = function (req, res) {
        render_error(req, res, '404');
    };

    this.render500 = function (req, res) {
        render_error(req, res, '500');
    };
}

module.exports = BaseModule;
