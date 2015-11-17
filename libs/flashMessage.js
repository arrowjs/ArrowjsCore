'use strict';

let _ = require('lodash');

module.exports = function () {
    let app = this;
    app.use(function (req, res, next) {
        res.locals.messages = req.session.flash;

        if (!req.session.flash) {
            req.session.flash = [];
        }

        let easyFlash = {
            success: function (content) {
                req.session.flash.success = req.session.flash.success || [];
                req.session.flash.success.push(content)
            },
            error: function (content) {
                req.session.flash.error = req.session.flash.error || [];
                req.session.flash.error.push(content)
            },
            warn: function (content) {
                req.session.flash.warn = req.session.flash.warn || [];
                req.session.flash.warn.push(content)
            },
            info: function (content) {
                req.session.flash.info = req.session.flash.info || [];
                req.session.flash.info.push(content)
            }
        };
        _.assign(req.flash, easyFlash);
        next()
    });
    return null;
};