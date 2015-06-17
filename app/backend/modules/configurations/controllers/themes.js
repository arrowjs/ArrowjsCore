'use strict'
/**
 * Created by thanhnv on 3/4/15.
 */

var util = require('util'),
    _ = require('lodash');
var config = require(__base + 'config/config');
var redis = require("redis").createClient(),
    route = 'configurations';

var breadcrumb =
    [
        {
            title: 'Home',
            icon: 'fa fa-dashboard',
            href: '/admin'
        },
        {
            title: 'Configurations',
            href: '/admin/configurations'
        },
        {
            title: 'Themes',
            href: '/admin/configurations/themes'
        }
    ];


function ConfigurationsThemesModule() {
    BaseModuleBackend.call(this);
    this.path = "/configurations";
}
let _module = new ConfigurationsThemesModule();


_module.index = function (req, res) {
    // Breadcrumb
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb);

    let themes = [];

    config.getGlobbedFiles(__base + 'app/frontend/themes/*/theme.json').forEach(function (filePath) {
        themes.push(require(filePath));
    });
    let current_theme;
    for (let i in themes) {
        if (themes[i].alias.toLowerCase() == config.themes.toLowerCase()) {
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

    config.getGlobbedFiles(__base + 'app/frontend/themes/*/theme.json').forEach(function (filePath) {
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
    config.themes = req.params.themeName;
    redis.set(config.redis_prefix +config.key, JSON.stringify(config), redis.print);
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
