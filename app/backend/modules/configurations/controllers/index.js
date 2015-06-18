"use strict";
/**
 * Created by thanhnv on 2/17/15.
 */

let   util = require('util'),
    _ = require('lodash');
let redis = require('redis').createClient();
let breadcrumb =
    [
        {
            title: 'Home',
            icon: 'fa fa-dashboard',
            href: '/admin'
        },
        {
            title: 'Configurations',
            href: '#'
        },
        {
            title: 'Site info',
            href: '#'
        }
    ];

function ConfigurationsModule() {
    BaseModuleBackend.call(this);
    this.path = "/configurations";
}
let _module = new ConfigurationsModule();

_module.index = function (req, res) {
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb);
    let seo_enable = __seo_enable;
    _module.render(req, res, 'sites/index', {
        __config: __config,
        seo_enable: seo_enable,
        title: 'Cấu hình hệ thống'
    });
};
_module.update_setting = function (req, res, next) {
    let data = req.body;

    // Site info
    __config.app.title = data.title;
    __config.app.description = data.description;
    __config.app.logo = data.logo;
    __config.app.icon = data.icon;
    __config.pagination.number_item = data.number_item;

    // Database info
    __config.db.host = data.db_host;
    __config.db.port = data.db_port;
    __config.db.username = data.db_username;
    if (data.db_password != '') {
        __config.db.password = data.db_password;
    }
    __config.db.dialect = data.db_dialect;
    if (data.logging) {
        __config.db.logging = true;
    }
    if(data.seo_enable == 'false') {
        redis.set(__config.redis_prefix +"seo_enable", false, function (err, res) {
            if (err) {
                console.log(" Redis reply error: " + err);
            } else {
                console.log(" Redis reply: " + res);
            }
        });
        __seo_enable = false;
    } else {
        redis.set(__config.redis_prefix +"seo_enable", true, function (err, res) {
            if (err) {
                console.log(" Redis reply error: " + err);
            } else {
                console.log(" Redis reply: " + res);
            }
        });
        __seo_enable = true;
    }

    //redis info
    __config.redis.host = data.redis_host;
    __config.redis.port = data.redis_port;

    redis.set(__config.redis_prefix +__config.key, JSON.stringify(__config), redis.print);
    req.flash.success('Saved success');
    next();

};

util.inherits(ConfigurationsModule, BaseModuleBackend);
module.exports = _module;