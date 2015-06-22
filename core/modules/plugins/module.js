'use strict';
/**
 * Created by thanhnv on 2/17/15.
 */
module.exports = function (modules) {
    modules.plugins = {
        title: 'Plugins',
        author: 'Jack',
        version: '0.1.0',
        description: 'Plugins management of website',
        system: true,
        rules: [
            {
                name: 'index',
                title: 'All Plugins'
            },
            {
                name: 'active',
                title: 'Active Plugin'
            }

        ],
        backend_menu: {
            title:'Plugins',
            icon:"fa fa-thumb-tack",
            menus: [
                {
                    rule: 'index',
                    title: 'All plugins',
                    link: '/'
                }

            ]
        }
    };
    return modules;

};

