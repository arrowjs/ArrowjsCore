'use strict';

var util = require('util'),
    _ = require('lodash');

let _module = new BackModule('dashboard');

_module.index = function (req, res) {
    _module.render(req, res, 'index');
};

module.exports = _module;