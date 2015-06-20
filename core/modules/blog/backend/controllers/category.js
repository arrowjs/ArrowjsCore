'use strict';

let route = 'blog';
let util = require('util');
let slug = require('slug');

function CategoriesModule() {
    BaseModuleBackend.call(this);
    this.path = "/blog";
}
let _module = new CategoriesModule;

/**
 * List of categories
 */
_module.list = function (req, res) {
    // Add buttons
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');

    // Get current page and default sorting
    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || '';
    res.locals.root_link = '/admin/blog/category/page/' + page + '/sort';

    // Create filter
    let filter = __.createFilter(req, res, route, '/admin/blog/category/page', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: "name",
            header: "Tên",
            link: '/admin/blog/categories/{id}',
            acl: 'update',
            type: 'inline',
            pk: '{id}',
            filter: {
                data_type: 'string'
            }
        }
    ]);
    // Find all categories
    __models.category.findAndCountAll({
        attributes: ['id', 'name'],
        where: filter.values,
        order: column + " " + order,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);
        console.log('asgdjsadghjasgdjgsadjhagsdj');
        // Render view
        _module.render(req, res, 'category/index', {
            title: "Danh mục bài viết",
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.stack);
        res.redirect('/admin/err/500');
    });
};

/**
 * Create a category
 */
_module.save = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
    let data = req.body;
    if (data.name != '') {
        data.description = '';
        __models.category.findAndCount({
            where: ['name = \'' + data.name + '\'']
        }).then(function (tags) {
            if (tags.count == 0) {
                data.count = 0;
                data.slug = slug(data.name).toLowerCase();

                __models.category.create(data).then(function (tag) {
                    res.json(tag);
                });
            } else return res.status(500).send('Tag already exist');
        });
    } else return res.status(500).send('Name is empty');
};

/**
 * Update a category
 */
_module.update = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
    let data = req.body;

    if (data.name == 'name') {
        data.name = data.value;
    }

    if (data.name == 'slug') {
        delete data['name'];
        data.slug = data.value;
    }

    __models.category.findById(req.params.catId).then(function (cat) {
        return cat.updateAttributes(data)
    }).then(function () {
        res.sendStatus(200);
    }).catch(function (err) {
        res.sendStatus(500)
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
                            //replace id cua tag cu bang id moi la 0 ~ uncategorize
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

_module.listAll = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');

    let query = req.param('query') || '';
    query = query.toLowerCase();

    __models.category.findAll({
        where: ['LOWER(name) like \'%' + query + '%\''],
        order: 'name asc'
    }).then(function (tags) {
        let data = [];
        if (tags.length > 0) {
            tags.forEach(function (t) {
                data.push({value: t.name, data: t.id});
            });
        }

        let result = {query: query, suggestions: data};
        res.json(result);
    });
};

util.inherits(CategoriesModule, BaseModuleBackend);
module.exports = _module;