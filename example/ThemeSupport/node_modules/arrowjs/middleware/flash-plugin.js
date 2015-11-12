'use strict';

module.exports = function (req, res, next) {
    if (!req.session.messages) {
        req.session.messages = [];
    }

    req.flash = {
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

    next();
};
