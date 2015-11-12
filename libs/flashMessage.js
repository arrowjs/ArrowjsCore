'use strict';

let _ = require('lodash');

module.exports = function () {
    let app = this;
//TODO : testing flash messages;
    app.use(function (req, res, next) {
        res.locals.messages = req.session.messages;

        if (!req.session.messages) {
            req.session.messages = [];
        }

        let easyFlash = {
            success: function (content) {
                req.session.messages.push({
                    type: 'success',
                    content: content
                })
            },
            error: function (content) {
                req.session.messages.push({
                    type: 'error',
                    content: content
                })
            },
            warning: function (content) {
                req.session.messages.push({
                    type: 'warning',
                    content: content
                })
            },
            info: function (content) {
                req.session.messages.push({
                    type: 'info',
                    content: content
                })
            }
        };
        _.assign(req.flash, easyFlash);
        next()
    });
    return null;
};
