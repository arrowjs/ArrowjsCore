'use strict';

module.exports = function (modules) {
    modules.dashboard = {
        title: 'Dashboard',
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description: 'Dashboard',
        rules: [
            {
                name: 'index',
                title: 'View'
            }
        ]
    };

    return modules;
};

