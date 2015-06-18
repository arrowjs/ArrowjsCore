'use strict';

var BaseWidget = require('../base_widget'),
    util = require('util'),
    config = require(__base + 'config/config'),
    _ = require('lodash');

function Menus() {
    let _base_config = {
        alias: "arr_menus",
        name: "Menus",
        description: "Show one of menus in Menu module",
        author: "Nguyen Van Thanh",
        version: "0.1.0",
        options: {
            menu_id: ''
        }
    };

    Menus.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(Menus, BaseWidget);

//Override save method
Menus.prototype.render_setting = function (widget_type, widget) {
    let _this = this;
    return new Promise(function (done, err) {
        __models.menus.findAll({
            where: {
                status: 'publish'
            },
            order: ["id"],
            raw : true
        }).then(function (menus) {
            _this.env.render(widget_type + '/setting.html', {
                    widget_type: widget_type,
                    widget: widget,
                    menus: menus,
                    files: _this.files
                },
                function (err, re) {
                    done(re);
                });
        });
    });
};

Menus.prototype.render = function (widget, route) {
    let _this = this;
    //Processing here
    return new Promise(function (resolve, reject) {
        __models.menus.findById(widget.data.menu_id).then(function (menu) {
            __models.menu_detail.findAll({
                where: {
                    menu_id: menu.id
                },
                raw : true
            }).then(function (menu_details) {
                //get menu order
                let menu_order = JSON.parse(menu.menu_order);
                resolve(BaseWidget.prototype.render.call(_this, widget, {
                    route: route,
                    _menus: menu_order,
                    _menus_data: menu_details
                }));
            });

        });
    });

};

module.exports = Menus;
