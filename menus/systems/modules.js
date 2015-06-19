'use strict'
/**
 * Created by thanhnv on 2/25/15.
 */
module.exports = function (menus) {
    menus.systems.modules.modules = {
        title:'Modules',
        icon:"fa fa-rocket",
        menus: [
            {
                rule: 'index',
                title: 'Danh sách',
                link: '/'
            }

        ]
    };
    return menus;
};
