'use strict';

module.exports = function (modules) {
    modules.users = {
        title: __.t('m_users_title'),
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description: __.t('m_users_description'),
        rules: [
            {
                name: 'index',
                title: __.t('m_users_rule_index')
            },
            {
                name: 'create',
                title: __.t('m_users_rule_create')
            },
            {
                name: 'update',
                title: __.t('m_users_rule_update')
            },
            {
                name: "update_profile",
                title: __.t('m_users_rule_update_profile')
            },
            {
                name: 'delete',
                title: __.t('m_users_rule_delete')
            }
        ],
        backend_menu: {
            title: __.t('m_users_title'),
            icon: "fa fa-user",
            menus: [
                {
                    rule: 'index',
                    title: __.t('m_users_rule_index'),
                    link: '/'
                },
                {
                    rule: 'create',
                    title: __.t('m_users_rule_create'),
                    link: '/create'
                }
            ]
        }
    };

    return modules;
};

