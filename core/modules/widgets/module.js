'use strict';
/**
 * Created by thanhnv on 2/17/15.
 */
module.exports = function (modules) {
    modules.widgets = {
        title: 'Widgets',
        author: 'Nguyen Van Thanh',
        version: '0.1.1',
        description: 'Widget management of website',
        system: true,
        rules: [
            {
                name: 'index',
                title: 'All Widgets'
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

