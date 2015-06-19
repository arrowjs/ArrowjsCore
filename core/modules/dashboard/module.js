'use strict'
/**
 * Created by thanhnv on 2/17/15.
 */
module.exports = function (modules) {
    modules.dashboard = {
        title: 'Dashboard',
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description:'Dashboard',
        system:true,
        rules: [
            {
                name: 'index',
                title: 'View'
            }
        ]
    }
    return modules;

};

