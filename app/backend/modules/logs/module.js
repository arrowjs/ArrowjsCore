'use strict'
/**
 * Created by thanhnv on 2/4/15.
 */
module.exports = function (modules) {
    modules.logs = {
        title: 'Logs',
        author: 'Vu Hoang Chung',
        version: '0.1.0',
        description:'Log system',
        system: true,
        rules: [
            {
                name: 'index',
                title: 'All Logs'
            },
            {
                name: 'create',
                title: 'Create log'
            },
            {
                name: 'update',
                title: 'Update'
            },
            {
                name: 'delete',
                title: 'Delete'
            }
        ]
    };
    return modules;

};

