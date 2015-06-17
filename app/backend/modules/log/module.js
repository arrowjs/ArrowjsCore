'use strict';

module.exports = function (modules) {
    modules.logs = {
        title: 'Log',
        author: 'Vu Hoang Chung',
        version: '0.0.1',
        description: 'Log system',
        system: true,
        rules: [
            {
                name: 'index',
                title: 'All Logs'
            },
            {
                name: 'create',
                title: 'Create Log'
            },
            {
                name: 'update',
                title: 'Update Log'
            },
            {
                name: 'delete',
                title: 'Delete Log'
            }
        ]
    };
    return modules;
};

