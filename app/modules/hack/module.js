module.exports = function (modules) {
    modules.hack = {
        title: 'Hack',
        author: 'TechmasterVN',
        version: '0.0.1',
        description: 'Test',
        rules: [
            {
                name: 'hack',
                title: 'Hack'
            }
        ],
        backend_menu: {
            title:'Hack',
            icon:'fa fa-newspaper-o',
            menus: [
                {
                    rule: 'hack',
                    title: 'Hack',
                    link: '/hack'
                }
            ]
        }
    };
    return modules;
};

