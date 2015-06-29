'use strict';

module.exports = function (modules) {
    modules.users = {
        title: 'Users',
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description: 'Users management of website',
        rules: [
            {
                name: 'index',
                title: 'All Users'
            },
            {
                name: 'create',
                title: 'Create New'
            },
            {
                name: 'update',
                title: 'Update'
            },
            {
                name: 'update_profile',
                title: 'Update profile'
            },
            {
                name: 'delete',
                title: 'Delete'
            }
        ],
        backend_menu: {
            title: __.t('m_user_title'),
            icon: "fa fa-user",
            menus: [
                {
                    rule: 'index',
                    title: 'All users',
                    link: '/'
                },
                {
                    rule: 'create',
                    title: 'Create new user',
                    link: '/create'
                }

            ]
        }
    };

    return modules;
};

