'use strict';

module.exports = function (modules) {
    modules.menu = {
        title: 'Menu',
        author: 'Nguyen Van Thanh',
        version: '0.0.1',
        description: 'Menu management of website frontend',
        system: true,
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
        ]
    };
    return modules;
};

