'use strict';

let BaseModule = require('./BaseModule.js');
let _ = require('lodash');
let callsite = require('callsite');
let backEnv = __.createNewEnv([__base + 'app/modules/', __base + 'core/modules/', __base + 'themes/backend/default/']);


class BackModule extends BaseModule {
    constructor() {
        let stack = callsite();
        let i = stack[1].getFileName().split('/');
        let g = i[i.length - 4];
        super(g);
        this.fullPath = stack[1].getFileName();
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
        if (self.fullPath.indexOf('modules') > -1 ) {
            if (self.path.indexOf('/') == 0) {
                view = self.path.substring(1) + '/backend/views/' + view;
            } else {
                view = self.path + '/backend/views/' + view;
            }
        }

        if (fn) {
            backEnv.render(view, _.assign(res.locals, options), fn);
        } else {
            backEnv.render(view, _.assign(res.locals, options), function (err, re) {
                if (err) {
                    res.send(err.stack);
                }else{
                    //console.log(Date.now() - req.timeout);
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

        backEnv.loaders[0].searchPaths = [__base + 'themes/backend/default'];

        backEnv.render(view, _.assign(res.locals, {}), function (err, re) {
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

module.exports = BackModule;