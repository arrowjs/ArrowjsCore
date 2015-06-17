'use strict'
/**
 * Created by thanhnv on 2/17/15.
 */
module.exports = function (modules) {
    modules.menus = {
        title: 'Menus',
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description:'Menus management of website frontend',
        system:true,
        rules: [
            {
                name: 'index',
                title: 'All Menus'
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
                name: 'delete',
                title: 'Delete'
            }
        ]
    }
    return modules;

};

