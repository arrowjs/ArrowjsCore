"use strict"
/**
 * Created by thanhnv on 2/28/15.
 */

module.exports = function (env) {
    env.addFilter('render_menu', function (route, menus, user) {
        let html = '';
        let sortedMenus = __.sortMenus(menus);
        sortedMenus.forEach(function (m) {
            //console.log(m);
            let i = m.menu;
            if (menus[i] != undefined) {
                if (user.acl[i] != undefined) {
                    let cls = __.active_menu(route, i.replace('_', '-'));
                    html += '<li class="' + cls + '">';
                    if (menus[i].menus.length == 1)
                        html += '<a href="/admin/' + (i.replace('_', '-') + menus[i].menus[0].link) + '">';
                    else
                        html += '<a href="javascript:;">';
                    html += '<i class="icon-arrow-right"></i>';
                    html += '<span class="title">' + menus[i].title + '</span>';
                    html += '<span class="arrow "></span>';
                    html += '</a>';

                    if (menus[i].menus.length > 1) {
                        //check submenu
                        html += '<ul class="sub-menu">';
                        for (let y in menus[i].menus) {
                            if (user.acl[i].indexOf(menus[i].menus[y].name) > -1) {
                                html += '<li>';
                                html += '<a href="/admin/' + (i.replace('_', '-') + menus[i].menus[y].link) + '">';
                                html += '<i class="icon-list"></i>';
                                html += menus[i].menus[y].title + '</a>';
                                html += '</li>';
                            }
                        }
                        html += '</ul>';
                        html += '</li>';
                    }
                }
            }
        });

        return html;
    });
}
