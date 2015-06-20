'use strict';

var util = require('util'),
    _ = require('lodash');

function DashboardModule() {
    BaseModuleBackend.call(this);
    this.path = "/dashboard";
}
let _module = new DashboardModule();

_module.index = function (req, res) {
    _module.render(req, res, 'index');
};

util.inherits(DashboardModule, BaseModuleBackend);
module.exports = _module;