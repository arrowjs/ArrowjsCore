'use strict';

let _ = require('lodash');

let flash = require('connect-flash');

/**
 * Using middleware flash message;
 * @returns {null}
 */
module.exports = function () {
    let app = this;
    app.use(flash());

    app.use(function (req, res, next) {

        req.session.flash = req.session.flash || {};

        res.locals.messages = req.session.flash ;

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