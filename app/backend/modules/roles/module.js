'use strict'
/**
 * Created by thanhnv on 2/17/15.
 */
module.exports = function (modules) {
    modules.roles = {
        title: 'Roles',
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description: 'Roles management of website',
        system: true,
        rules: [
            {
                name: 'index',
                title: 'All Roles'
            },
            {
                name: 'create',
                title: 'Add New'
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

