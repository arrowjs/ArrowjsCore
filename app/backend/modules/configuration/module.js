'use strict'
/**
 * Created by thanhnv on 2/17/15.
 */
module.exports = function (modules) {
    modules.configurations = {
        title: 'Configurations',
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description:'Configuration information of website',
        system:true,
        rules: [
            {
                name: 'update_info',
                title: 'Update site information'
            },
            {
                name: 'change_themes',
                title: 'Change theme'
            },
            {
                name: 'import_themes',
                title: 'Import new theme'
            },
            {
                name: 'delete_themes',
                title: 'Delete theme'
            }
        ]
    }
    return modules;

};

