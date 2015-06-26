'use strict';

var _ = require('lodash');

let _module = new BackModule('dashboard');

_module.index = function (req, res) {
    _module.render(req, res, 'index');
};

module.exports = _module;