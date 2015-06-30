'use strict';

let slug = require('slug');

let _module = new BackModule('blog');
let route = 'blog';

/**
 * List of categories
 */
_module.list = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');

    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || '';
    res.locals.root_link = '/admin/blog/categories/page/' + page + '/sort';

    // Create filter
    let filter = __.createFilter(req, res, route, '/admin/blog/categories', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: "name",
            header: "Tên",
            width: '40%',
            link: '/admin/blog/categories/{id}',
            acl: 'update',
            type: 'inline',
            pk: '{id}',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: 'slug',
            header: 'Slug',
            width: '40%',
            link: '/admin/blog/categories/{id}',
            acl: 'update',
            type: 'inline',
            pk: '{id}'
        },
        {
            column: 'count',
            header: 'Posts',
            width: '19%'
        }
    ]);

    __models.category.findAndCountAll({
        where: filter.values,
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);

        _module.render(req, res, 'category/index', {
            title: "All categories",
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    });
};

/**
 * Create a category
 */
_module.save = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');

    let data = req.body;

    __models.category.create(data).then(function () {
        req.flash.success('Category created successfully');
        res.redirect('/admin/blog/categories');
    }).catch(function (err) {
        req.flash.error(err.name + ': ' + err.message);
        res.redirect('/admin/blog/categories');
    });
};

/**
 * Update a category
 */
_module.update = function (req, res) {
    console.log('aaaa');
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
    let data = req.body;

    if (data.name == 'name') {
        data.name = data.value;
    }

    if (data.name == 'alias') {
        delete data['name'];
        data.alias = data.value;
    }

    __models.category.find({
        where: {
            id: req.params.catId
        }
    }).then(function (cat) {
        cat.updateAttributes(data)
    }).then(function () {
        let response = {
            type: 'success',
            message: 'Update successfully'
        };
        res.json(response);
    }).catch(function (err) {
        let response = {
            type: 'error',
            error: err.stack
        };
        res.json(response);
    });
};

/**
 * Delete a category
 */
_module.delete = function (req, res, next) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');

    Promise.all([
        function () {
            let listId = req.param('ids').split(',');
            listId.forEach(function (id) {
                __models.post.findAll({
                    where: ['cat_id like \'%:' + id + ':%\'']
                }).then(function (posts) {
                    if (posts.length > 0) {
                        posts.forEach(function (post) {
                            let btag = post.cat_id;
                            // 0 ~ uncategorize
                            let newBtag = btag.replace(':' + id + ':', ':0:');
                            post.updateAttributes({
                                cat_id: newBtag
                            }).on('success', function () {
                                __models.category.find({
                                    where: ['name=\'Uncategorized\'']
                                }).then(function (tag) {
                                    let count = +tag.count + 1;
                                    tag.updateAttributes({
                                        count: count
                                    }).on('success', function () {
                                        //console.log(chalk.green('Update tag'+ tag.id + ': count success'));
                                    });
                                })
                            });
                        });
                    }
                })
            })
        },
        __models.category.destroy({
            where: {
                id: {
                    'in': req.param('ids').split(',')
                }
            }
        })
    ]).then(function () {
        req.flash.success('Xóa danh mục thành công');
        res.send(200);
    });
};

module.exports = _module;