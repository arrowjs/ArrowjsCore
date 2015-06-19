module.exports = function (modules) {
    modules.blog = {
        title: 'Blog',
        author: 'TechmasterVN',
        version: '0.0.1',
        description: 'Blog Manager',
        system: true,
        rules: [
            {
                name: 'category_index',
                title: 'View All Categories'
            },
            {
                name: 'category_create',
                title: 'Create New Category'
            },
            {
                name: 'category_edit',
                title: 'Edit Category'
            },
            {
                name: 'category_delete',
                title: 'Delete Category'
            },
            {
                name: 'post_index',
                title: 'View All Posts'
            },
            {
                name: 'post_create',
                title: 'Create New Post'
            },
            {
                name: 'post_edit',
                title: 'Edit Own Post'
            },
            {
                name: 'post_edit_all',
                title: 'Edit All Post'
            },
            {
                name: 'post_delete',
                title: 'Delete Post'
            },
            {
                name: 'page_index',
                title: 'View All Pages'
            },
            {
                name: 'page_create',
                title: 'Create New Page'
            },
            {
                name: 'page_edit',
                title: 'Edit Own Page'
            },
            {
                name: 'page_edit_all',
                title: 'Edit All Pages'
            },
            {
                name: 'page_delete',
                title: 'Delete Page'
            }
        ]
    };
    return modules;
};

