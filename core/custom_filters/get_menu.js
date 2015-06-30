"use strict";


module.exports = function (env) {
    env.addFilter('get_menu', function (menu_name, route, cb) {
        __models.menus.find({
            where: {
                name: menu_name
            },
            raw: true
        }).then(function (menu) {
            __models.menu_detail.findAll({
                where: {
                    menu_id: menu.id
                },
                raw: true
            }).then(function (menu_details) {
                // Get menu order
                let menu_order = JSON.parse(menu.menu_order);

                env.render(__config.themes + '/_menus/main_menu.html', {
                        route: route,
                        _menus: menu_order,
                        _menus_data: menu_details
                    },
                    function (err, res) {
                        cb(err, res);
                    }
                );
            });
        });
    }, true);
};
