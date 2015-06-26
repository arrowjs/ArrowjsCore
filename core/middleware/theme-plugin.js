'use strict';

let fs = require('fs');

module.exports = function (req, res, next) {
    // Grab reference of render
    let _render = res.render;

    // Override logic
    res.render = function (view, options, fn) {
        // Get messages from session
        res.locals.messages = req.session.messages;

        // Clear session messages
        req.session.messages = [];

        // Check if is using admin view
        let route = res.locals.route.split('/')[1];
        if (route === __config.admin_prefix) {
            view = 'admin/' + view;
        } else {
            let tmp = __config.theme + '/' + view;
            if (fs.existsSync(__base + 'app/themes/' + tmp + '.html')) {
                view = tmp;
            }
            else {
                view = "default/" + view;
            }
        }

        // continue with original render
        _render.call(this, view, options, fn);
    };
    next();
};