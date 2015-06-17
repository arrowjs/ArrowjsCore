'use strict'
/**
 * Created by thanhnv on 2/25/15.
 */
module.exports = function (menus) {
    menus.systems.modules.roles = {
        title:'Vai trò',
        icon:"fa fa-group",
        menus: [
            {
                rule: 'index',
                title: 'Danh sách',
                link: '/'
            },
            {
                rule: 'create',
                title: 'Tạo mới',
                link: '/create'
            }

        ]
    };
    return menus;
};
