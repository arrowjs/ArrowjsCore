'use strict'
/**
 * Created by thanhnv on 2/25/15.
 */
module.exports = function (menus) {
    menus.default.modules.blog = {
        title:'Blog',
        icon:'fa fa-newspaper-o',
        menus: [
            {
                rule: 'post_index',
                title: 'Bài viết',
                link: '/post/page/1'
            },
            {
                rule: 'page_index',
                title: 'Pages',
                link: '/page/page/1'
            },
            {
                rule: 'category_index',
                title: 'Danh mục bài viết',
                link: '/category/page/1'
            }
        ]
    };
    return menus;
};