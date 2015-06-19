'use strict'
/**
 * Created by thanhnv on 2/25/15.
 */
module.exports = function (menus) {
    menus.systems.modules.widgets = {
        title: 'Widgets',
        icon: 'fa fa-file-text',
        menus: [
            {
                rule: 'index',
                title: 'Sidebars',
                link: '/sidebars'
            },
            {
                rule: 'index',
                title: 'Danh sách Widgets',
                link: '/'
            }
        ]
    };
    return menus;
};
