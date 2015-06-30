'use strict';

var _ = require('lodash');
var redis = require("redis").createClient();

let _module = new BackModule('configurations');
let route = 'configurations';

_module.index = function (req, res) {
    let themes = [];

    __.getGlobbedFiles(__base + 'themes/frontend/*/theme.json').forEach(function (filePath) {
        themes.push(require(filePath));
    });

    let current_theme;
    for (let i in themes) {
        if (themes.hasOwnProperty(i) && themes[i].alias.toLowerCase() == __config.theme.toLowerCase()) {
            current_theme = themes[i];
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

    __.getGlobbedFiles(__base + 'themes/frontend/*/theme.json').forEach(function (filePath) {
        themes.push(require(filePath));
    });

    let current_theme;
    for (let i in themes) {
        if (themes.hasOwnProperty(i) && themes[i].alias.toLowerCase() == req.params.themeName) {
            current_theme = themes[i];
        }
    }

    _module.render(req, res, 'themes/detail', {
        current_theme: current_theme,
        title: 'Chi tiết giao diện'
    });
};

_module.change_themes = function (req, res) {
    __config.theme = req.params.themeName;
    redis.set(__config.redis_prefix + __config.key, JSON.stringify(__config), redis.print);
    res.send("ok");
};

_module.delete = function (req, res) {
    res.send("ok")
};

_module.import = function (req, res) {
    res.send("ok")
};

module.exports = _module;
