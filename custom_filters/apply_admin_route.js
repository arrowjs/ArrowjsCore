'use strict';

//todo: hoi anh thanh
module.exports = function (env) {
    env.addFilter('apply_admin_route', function (route) {
            var st = route.split('/');
            let link = '';

            if (st.length > 0) {
                let module = st[1];
                let pre = '<li class=" menu-item "><a href="';
                let sur = '">Edit</a></li>';
                if (st.length == 3 && st[1] == 'trungtam') {
                    link = '/admin/blog/pages/' + st[2];
                }
                if (st.length == 4) {
                    switch (module) {
                        case 'posts':
                            link = '/admin/blog/posts/' + st[2];
                            break;
                        case 'khoa-hoc':
                            link = '/admin/courses/' + st[2];
                            break;
                        case 'books':
                        case 'jobs':
                        case 'interviews':
                            link = '/admin/' + module + '/' + st[2];
                            break;
                    }
                }
                return (link != '') ? pre + link + sur : link;
            }
            else {
                return '';
            }
        }
    );
};