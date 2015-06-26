'use strict';

module.exports = function (modules) {
    modules.configurations = {
        title: 'Configuration',
        author: 'Nguyen Van Thanh',
        version: '0.0.1',
        description: 'Configuration information of website',
        rules: [
            {
                name: 'update_info',
                title: 'Update site information'
            },
            {
                name: 'change_themes',
                title: 'Change theme'
            },
            {
                name: 'import_themes',
                title: 'Import new theme'
            },
            {
                name: 'delete_themes',
                title: 'Delete theme'
            }
        ],
        backend_menu: {
            title: 'Configuration',
            icon: "fa fa-cog",
            menus: [
                {
                    rule: 'update_info',
                    title: 'Systems',
                    link: '/site-info'
                },
                {
                    rule: 'change_themes',
                    title: 'Themes',
                    link: '/themes'
                }
            ]
        }
    };

    return modules;
};

