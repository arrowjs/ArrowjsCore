'use strict'
/**
 * Created by thanhnv on 2/25/15.
 */
module.exports = function (menus) {
    menus.systems.modules.configurations = {
        title:'Cấu hình',
        icon:"fa fa-cog",
        menus: [
            {
                rule: 'update_info',
                title: 'Hệ thống',
                link: '/site-info'
            },
            {
                rule: 'change_themes',
                title: 'Giao diện',
                link: '/themes'
            }
        ]
    };
    return menus;
};
