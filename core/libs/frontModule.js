'use strict'
let BaseModule = require('./baseModule.js');
var debug = require('debug')("BaseModule Front End"),
    fs = require('fs'),
    _ = require('lodash');

class FrontModule extends BaseModule {
    constructor(path) {
        super(path);
        this.env = __.createNewEnv([__base + 'themes/frontend/default/', __base + 'core/modules/', __base + 'modules/']);
    }

    render(req, res, view, options, fn) {
        let self = this;
        //get messages from session
        res.locals.messages = req.session.messages;
        //clear session messages
        req.session.messages = [];
        if (view.indexOf('.html') == -1) {
            view += '.html';
        }
        let tmp = __config.themes + '/_modules' + self.path + '/' + view;
        if (fs.existsSync(__base + 'themes/frontend' + tmp)) {
            this.env.loaders[0].searchPaths = [__base + 'themes/frontend'];
            view = __config.themes + '/_modules' + self.path + '/' + view;
        }
        else {
            this.env.loaders[0].searchPaths = [__base + 'themes/frontend', __base + 'core/modules', __base + 'modules'];
            if (self.path.indexOf('/') == 0) {
                view = self.path.substring(1) + '/frontend/views/' + view;
            }
            else {
                view = self.path + '/views/' + view;
            }
        }
        if (fn) {
            this.env.render(view, _.assign(res.locals, options), fn);
        } else {
            //console.log('*************', this.env.loaders, view, tmp);
            this.env.render(view, _.assign(res.locals, options), function (err, re) {
                if (err) {
                    res.send(err.stack);
                }
                res.send(re);

            });
        }
    }

    render_error(req, res, view) {
        let self = this;
        //get messages from session
        res.locals.messages = req.session.messages;
        //clear session messages
        req.session.messages = [];
        if (view.indexOf('.html') == -1) {
            view += '.html';
        }
        this.env.loaders[0].searchPaths = [__dirname + '/themes', __dirname + '/themes/' + __config.themes];
        this.env.render(view, _.assign(res.locals, options), function (err, re) {
            res.send(re);
        });
    }

    render404(req, res) {
        render_error(req, res, '404');
    }

    render500(req, res) {
        render_error(req, res, '500');
    }

;
}

module.exports = FrontModule;