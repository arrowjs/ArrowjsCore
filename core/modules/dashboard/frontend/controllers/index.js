'use strict';

let util = require('util'),
    _ = require('lodash');

let _module = new BackModule('dashboard');

_module.index = function (req, res) {
    let index_view = 'index';
    _module.render(req, res, index_view, {
        user: req.user || null
    });
};

module.exports = _module;