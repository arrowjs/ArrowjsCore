"use strict"
/**
 * Created by thanhnv on 2/28/15.
 */
let config = require(__base + 'config/config');

module.exports = function (env) {
    env.addFilter('get_menu', function (menu_name, route, cb) {

        __models.menus.find({
            where: {
                name: menu_name
            }
        }, {raw: true}).then(function (menu) {
            __models.menu_detail.findAll({
                where: {
                    menu_id: menu.id
                }
            }, {raw: true}).then(function (menu_details) {
                //get menu order
                let menu_order = JSON.parse(menu.menu_order);
                env.render(config.themes + '/_menus/main_menu.html', {
                        route:route,
                        _menus: menu_order,
                        _menus_data: menu_details
                    },
                    function (err, res) {
                        cb(err, res);
                    });
                /*let getMenuItem = function (id) {
                 for (let i in menu_details) {
                 if (menu_details[i].id == id) {
                 return menu_details[i];
                 }
                 }
                 }
                 let html = '';
                 let buildMenu = function (arr) {
                 let tmp = '';
                 for (let i in arr) {
                 let mn = getMenuItem(arr[i].id);
                 let active = mn.link.substring(1) === route.substring(1);
                 if (arr[i].children) {
                 tmp += '<li class="' + menu.li_cls + ' ' + (active ? menu.li_active_cls : "") + '"><a class="' + menu.a_cls + '" data-toggle="dropdown" href="' + mn.link + '">' + mn.name + ' <i class="fa fa-angle-down"></i></a>';
                 tmp += '<ul class="' + menu.sub_ul_cls + '">';
                 tmp += buildMenu(arr[i].children);
                 tmp += '</ul>';
                 }
                 else {
                 tmp += '<li class="' + (active ? menu.li_active_cls : "") + '"><a href="' + mn.link + '"> ' + mn.name + '</a>';
                 }
                 tmp += '</li>';
                 }
                 return tmp;

                 }
                 html += '<ul class="' + menu.root_ul_cls + '">';
                 html += buildMenu(menu_order);
                 html += '</ul>';*/

                //cb(null, html);
            });

        });

    }, true);
}
