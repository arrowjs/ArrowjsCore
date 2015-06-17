"use strict";

var debug = require('debug')("BaseBackEnd"),
    nunjucks = require('nunjucks'),
    _ = require('lodash');
var env = __.createNewEnv([__dirname + '/views_layout', __dirname + '/modules']);

function BaseModuleBackend() {
    this.render = function (req, res, view, options, fn) {
        let self = this;

        // Get messages from session
        res.locals.messages = req.session.messages;

        // Clear session messages
        req.session.messages = [];
        if (view.indexOf('.html') == -1) {
            view += '.html';
        }

        if (self.path.indexOf('/') == 0) {
            view = self.path.substring(1) + '/views/' + view;
        } else {
            view = self.path + '/views/' + view;
        }

        if (fn) {
            env.render(view, _.assign(res.locals, options), fn);
        } else {
            env.render(view, _.assign(res.locals, options), function (err, re) {
                console.log(view);
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
        env.loaders[0].searchPaths = [__dirname + '/views_layout'];
        env.render(view, _.assign(res.locals, {}), function (err, re) {
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

module.exports = BaseModuleBackend;
