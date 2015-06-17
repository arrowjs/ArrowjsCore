'use strict'
/**
 * Created by thanhnv on 2/25/15.
 */
module.exports = function (menus) {
    menus.systems.modules.plugins = {
        title:'Plugins',
        icon:"fa fa-thumb-tack",
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
