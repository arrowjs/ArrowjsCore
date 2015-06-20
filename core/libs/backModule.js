'use strict'
let BaseModule = require('./baseModule.js');
let _ = require('lodash');


class BackModule extends BaseModule {
    constructor(path) {
        super(path);
        this.env = __.createNewEnv([__base + 'themes/backend/default/', __base + 'core/modules/', __base + 'modules/']);
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

        if (self.path.indexOf('/') == 0) {
            view = self.path.substring(1) + '/backend/views/' + view;
        } else {
            view = self.path + '/backend/views/' + view;
        }

        if (fn) {
            this.env.render(view, _.assign(res.locals, options), fn);
        } else {
            //console.log('*************', this.env.loaders, view);
            this.env.render(view, _.assign(res.locals, options), function (err, re) {
                if (err) {
                    res.send(err.stack);
                }
                res.send(re);

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
        this.env.loaders[0].searchPaths = [__base + 'themes/backend/default'];
        this.env.render(view, _.assign(res.locals, {}), function (err, re) {
            res.send(re);
        });
    }

    render404(req, res) {
        render_error(req, res, '404');
    }

    render500(req, res) {
        render_error(req, res, '500');
    }
}


module.exports = BackModule;