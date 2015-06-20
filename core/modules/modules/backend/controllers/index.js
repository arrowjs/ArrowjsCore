'use strict';

var util = require('util'),
    _ = require('lodash');
let redis = require('redis').createClient();
let route = 'modules';

function ModulesModule() {
    BaseModuleBackend.call(this);
    this.path = "/modules";
}
let _module = new ModulesModule();

_module.index = function (req, res) {
    _module.render(req, res, 'index', {
        title: "All Modules",
        modules: __modules
    });
};

_module.active = function (req, res) {
    if (__modules[req.params.route].active == undefined || __modules[req.params.route].active == false) {
        req.flash.success('Module ' + req.params.route + ' has active');
        __modules[req.params.route].active = true;
    } else {
        req.flash.error('Module ' + req.params.route + ' has un-active');
        __modules[req.params.route].active = false;
    }

    redis.set(__config.redis_prefix + 'all_modules', JSON.stringify(__modules), redis.print);
    return res.redirect('/admin/modules');
};

_module.reload = function (req, res, next) {
    let md = require(__base + 'core/libs/modules_manager.js');
    md.loadAllModules();
    req.flash.success("Reload all modules");
    next();
};

util.inherits(ModulesModule, BaseModuleBackend);
module.exports = _module;
