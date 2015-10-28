'use strict';

let BaseModule = require('./BaseModule.js');
let fs = require('fs'),
    _ = require('lodash');
let callsite = require('./ArrStack');
let frontEnv = __.createNewEnv([__base + 'app/modules/', __base + 'core/modules/', __base + 'themes/frontend/']);


class FrontModule extends BaseModule {
    constructor() {
        let stack = callsite(2);
        let i = stack.split('/');
        let g = i[i.length - 4];
        super(g);
    }

    render(req, res, view, options, fn) {
        let self = this;

        // Get messages from session
        res.locals.messages = req.session.messages;

        // Clear session messages
        req.session.messages = [];

        if (view.indexOf('.html') == -1) {
            view += '.html';
        }

        let tmp = __config.theme + '/_modules' + self.path + '/' + view;

        if (fs.existsSync(__base + 'themes/frontend/' + tmp)) {
            frontEnv.loaders[0].searchPaths = [__base + 'themes/frontend'];
            view = __config.theme + '/_modules' + self.path + '/' + view;
        } else {
            frontEnv.loaders[0].searchPaths = [__base + 'app/modules', __base + 'core/modules', __base + 'themes/frontend', __base + 'themes/frontend/' + __config.theme];

            if (self.path.indexOf('/') == 0) {
                view = self.path.substring(1) + '/frontend/views/' + view;
            } else {
                view = self.path + '/views/' + view;
            }
        }

        if (fn) {
            frontEnv.render(view, _.assign(res.locals, options), fn);
        } else {
            frontEnv.render(view, _.assign(res.locals, options), function (err, re) {
                if (err) {
                    res.send(err.stack);
                } else {
                    res.send(re);
                }
            });
        }
    }

    render_error(req, res, view) {
        // Get messages from session
        res.locals.messages = req.session.messages;

        // Clear session messages
        req.session.messages = [];

        if (view.indexOf('.html') == -1) {
            view += '.html';
        }

        frontEnv.loaders[0].searchPaths = [__base + 'themes/frontend/' + __config.theme, __base + 'themes/frontend/'];
        frontEnv.render(view,res.locals , function (err, re) {
            res.send(re);
        });
    }

    render404(req, res) {
        this.render_error(req, res, '404');
    }

    render500(req, res) {
        this.render_error(req, res, '500');
    }
}

module.exports = FrontModule;