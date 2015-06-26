'use strict';

module.exports = function (modules) {
    modules.modules = {
        title: 'Modules',
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description: 'Modules management of website',
        system: true,
        rules: [
            {
                name: 'index',
                title: 'All Modules'
            },
            {
                name: 'active',
                title: 'Activate/Deactivate Modules'
            },
            {
                name: 'import',
                title: 'Import New Module'
            }
        ],
        backend_menu: {
            title: 'Modules',
            icon: "fa fa-rocket",
            menus: [
                {
                    rule: 'index',
                    title: 'All Modules',
                    link: '/'
                }
            ]
        }
    };

    return modules;
};

