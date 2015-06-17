"use strict";
/**
 * Created by thanhnv on 2/17/15.
 */

let   util = require('util'),
    _ = require('lodash');
let config = require(__base + 'config/config');
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
        config: config,
        seo_enable: seo_enable,
        title: 'Cấu hình hệ thống'
    });
};
_module.update_setting = function (req, res, next) {
    let data = req.body;

    // Site info
    config.app.title = data.title;
    config.app.description = data.description;
    config.app.logo = data.logo;
    config.app.icon = data.icon;
    config.pagination.number_item = data.number_item;

    // Database info
    config.db.host = data.db_host;
    config.db.port = data.db_port;
    config.db.username = data.db_username;
    if (data.db_password != '') {
        config.db.password = data.db_password;
    }
    config.db.dialect = data.db_dialect;
    if (data.logging) {
        config.db.logging = true;
    }
    if(data.seo_enable == 'false') {
        redis.set(config.redis_prefix +"seo_enable", false, function (err, res) {
            if (err) {
                console.log(" Redis reply error: " + err);
            } else {
                console.log(" Redis reply: " + res);
            }
        });
        __seo_enable = false;
    } else {
        redis.set(config.redis_prefix +"seo_enable", true, function (err, res) {
            if (err) {
                console.log(" Redis reply error: " + err);
            } else {
                console.log(" Redis reply: " + res);
            }
        });
        __seo_enable = true;
    }

    //redis info
    config.redis.host = data.redis_host;
    config.redis.port = data.redis_port;

    redis.set(config.redis_prefix +config.key, JSON.stringify(config), redis.print);
    req.flash.success('Saved success');
    next();

};

util.inherits(ConfigurationsModule, BaseModuleBackend);
module.exports = _module;