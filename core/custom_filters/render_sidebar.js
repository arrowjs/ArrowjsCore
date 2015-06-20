"use strict";

/** Render sidebar */
module.exports = function (env) {
    env.addFilter('render_sidebar', function (route, user) {
        let html = '';
        let sortGroups = __.sortMenus(__menus);

        for (let i in sortGroups) {
            let group = __menus[sortGroups[i].menu];

            if (!group.title) continue;

            html += '<li class="header">' + group.title + '</li>';

            let sortModules = __menus.sorting[sortGroups[i].menu];

            for (let y in sortModules) {
                let moduleName = sortModules[y];
                if (user.acl[moduleName] == undefined) continue;

                let subMenu = group.modules[moduleName];
                let icon = 'fa fa-circle-o text-danger';

                if (subMenu.icon) {
                    icon = subMenu.icon;
                }

                let cls = __.active_menu(route, moduleName.replace('-', '_'));

                html += '<li class="treeview ' + cls + '">' +
                '<a href="{{link}}">' +
                '<i class="' + icon + '"></i> <span>' + subMenu.title + '</span>';

                if (subMenu.menus.length > 1) {
                    html = html.replace('{{link}}', '#');
                    html += '<i class="fa fa-angle-right pull-right"></i></a>';
                    html += '<ul class="treeview-menu">';

                    for (let z in subMenu.menus) {
                        let mn = subMenu.menus[z];

                        if (user.acl[moduleName].indexOf(mn.rule) > -1) {
                            cls = __.active_menu(route, mn.link.replace('/', ''), "active", 3);
                            html += '<li class="treeview ' + cls + '">' +
                            '<a href="/admin/' + (moduleName.replace('_', '-') + mn.link) + '">' +
                            '<i class="fa fa-circle-o"></i> <span>' + mn.title + '</span>' +
                            '</a></li>';
                        }
                    }
                    html += '</ul></li>';
                } else {
                    if (group.title == 'Systems') {
                        html = html.replace('{{link}}', '/admin/' + moduleName.replace('_', '-') + '');
                    } else {
                        html = html.replace('{{link}}', '/admin' + subMenu.menus[0].link + '');
                    }

                    html += '</a></li>';
                }
            }
        }
        return html;
    });
};
