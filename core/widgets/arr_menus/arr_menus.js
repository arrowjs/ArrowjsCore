'use strict';

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash');

class Menus extends BaseWidget {
    constructor() {
        super();

        let conf = {
            alias: "arr_menus",
            name: "Menus",
            description: "Show one of menus in Menu module",
            author: "Nguyen Van Thanh",
            version: "0.1.0",
            options: {
                menu_id: ''
            }
        };
        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }

    render_setting(widget_type, widget) {
        let self = this;

        return new Promise(function (done, err) {
            __models.menus.findAll({
                where: {
                    status: 'publish'
                },
                order: ["id"],
                raw: true
            }).then(function (menus) {
                self.env.render(widget_type + '/setting.html', {
                        widget_type: widget_type,
                        widget: widget,
                        menus: menus,
                        files: self.files
                    },
                    function (err, re) {
                        done(re);
                    });
            });
        });
    }

    render(widget, route) {
        let self = this;

        return new Promise(function (resolve, reject) {
            __models.menus.findById(widget.data.menu_id).then(function (menu) {
                __models.menu_detail.findAll({
                    where: {
                        menu_id: menu.id
                    },
                    raw: true
                }).then(function (menu_details) {
                    let menu_order = JSON.parse(menu.menu_order);

                    resolve(BaseWidget.prototype.render.call(self, widget, {
                        route: route,
                        _menus: menu_order,
                        _menus_data: menu_details
                    }));
                });

            });
        });
    }
}

module.exports = Menus;
