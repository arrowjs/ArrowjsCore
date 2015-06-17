'use strict'
/**
 * Created by thanhnv on 2/17/15.
 */
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
                title: 'Active Modules'
            }

        ]
    }
    return modules;

};

