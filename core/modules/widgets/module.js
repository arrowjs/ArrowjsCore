'use strict';

module.exports = function (modules) {
    modules.widgets = {
        title: 'Widgets',
        author: 'Nguyen Van Thanh',
        version: '0.1.1',
        description: 'Widget management of website',
        rules: [
            {
                name: 'index',
                title: 'All Widgets'
            },
            {
                name: 'import',
                title: 'Import New Widget'
            }
        ],
        backend_menu: {
            title: 'Widgets',
            icon: 'fa fa-file-text',
            menus: [
                {
                    rule: 'index',
                    title: 'All Sidebars',
                    link: '/sidebars'
                },
                {
                    rule: 'index',
                    title: 'All Widgets',
                    link: '/'
                }
            ]
        }
    };

    return modules;
};

