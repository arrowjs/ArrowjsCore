'use strict';

module.exports = function (modules) {
    modules.menus = {
        title: 'Menu',
        author: 'Nguyen Van Thanh',
        version: '0.0.1',
        description: 'Menu management of website frontend',
        rules: [
            {
                name: 'index',
                title: 'All Menus'
            },
            {
                name: 'create',
                title: 'Create Menu'
            },
            {
                name: 'update',
                title: 'Update Menu'
            },
            {
                name: 'delete',
                title: 'Delete Menu'
            }
        ],
        backend_menu: {
            title: 'Menus',
            icon: "fa fa-bars",
            menus: [
                {
                    rule: 'index',
                    title: 'All menus',
                    link: '/'
                },
                {
                    rule: 'create',
                    title: 'Create new',
                    link: '/create'
                },
                {
                    rule: 'update',
                    title: 'Sorting Admin menu',
                    link: '/sort-admin-menu'
                }
            ]
        }
    };

    return modules;
};

