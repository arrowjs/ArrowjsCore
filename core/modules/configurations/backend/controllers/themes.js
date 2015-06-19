'use strict'
/**
 * Created by thanhnv on 3/4/15.
 */

var util = require('util'),
    _ = require('lodash');
var redis = require("redis").createClient(),
    route = 'configurations';

function ConfigurationsThemesModule() {
    BaseModuleBackend.call(this);
    this.path = "/configurations";
}
let _module = new ConfigurationsThemesModule();

//todo: co loi chua sua duoc
_module.index = function (req, res) {
    let themes = [];

    __config.getGlobbedFiles(__base + 'themes/frontend/*/theme.json').forEach(function (filePath) {
        themes.push(require(filePath));
    });

    let current_theme;
    for (let i in themes) {
        if (themes.hasOwnProperty(i) && themes[i].alias.toLowerCase() == __config.themes.toLowerCase()) {
            console.log(__current_theme, 'cho nay khong co log se bao loi tren IDE');
            current_theme = __current_theme = themes[i];
        }
    }

    _module.render(req, res, 'themes/index', {
        themes: themes,
        current_theme: current_theme,
        title: 'Cài đặt giao diện'
    });
};

_module.detail = function (req, res) {
    res.locals.backButton = __acl.addButton(req, route, 'change_themes', '/admin/configurations/themes');

    let themes = [];

    __config.getGlobbedFiles(__base + 'themes/frontend/*/theme.json').forEach(function (filePath) {
        themes.push(require(filePath));
    });
    let current_theme;
    for (let i in themes) {
        if (themes[i].alias.toLowerCase() == req.params.themeName) {
            current_theme = __current_theme = themes[i];
        }
    }

    _module.render(req, res, 'themes/detail', {
        current_theme: current_theme,
        title: 'Chi tiết giao diện'
    });
};

_module.change_themes = function (req, res) {
    __config.themes = req.params.themeName;
    redis.set(__config.redis_prefix +__config.key, JSON.stringify(__config), redis.print);
    res.send("OK");
};

_module.delete = function (req, res) {
    res.send("ok")
};

_module.import = function (req, res) {
    res.send("ok")
};

util.inherits(ConfigurationsThemesModule, BaseModuleBackend);
module.exports = _module;
