'use strict';

let util = require('util');
let config = require(__base + 'config/config');
let slug = require('slug-extend');
let async = require('async'),
    route = 'blog';
let sequelize = require('sequelize');
let Promise = require('bluebird');

let edit_view = 'post/new';

function PostsModule() {
    BaseModuleBackend.call(this);
    this.path = "/blog";
}
let _module = new PostsModule;

_module.list = function (req, res) {
    // Add buttons
    res.locals.createButton = __acl.addButton(req, route, 'post_create', '/admin/blog/posts/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'post_delete');

    // Get current page and default sorting
    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'desc';
    res.locals.root_link = '/admin/blog/posts/page/' + page + '/sort';

    // Create filter
    let filter = __.createFilter(req, res, route, '/admin/blog/posts', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: 'title',
            width: '25%',
            header: 'Tiêu đề',
            link: '/admin/blog/posts/{id}',
            acl: 'blog.post_edit',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: 'alias',
            width: '25%',
            header: 'Slug',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: 'user.display_name',
            width: '20%',
            header: 'Tác giả',
            filter: {
                data_type: 'string',
                filter_key: 'user.display_name'
            }
        },
        {
            column: 'created_at',
            width: '15%',
            header: 'Ngày tạo',
            type: 'datetime',
            filter: {
                type: 'datetime',
                filter_key: 'created_at'
            }
        },
        {
            column: 'published',
            width: '10%',
            header: 'Trạng thái',
            type: 'custom',
            alias: {
                "1": "Publish",
                "0": "Draft"
            },
            filter: {
                type: 'select',
                filter_key: 'published',
                data_source: [
                    {
                        name: 'Publish',
                        value: 1
                    },
                    {
                        name: 'Draft',
                        value: 0
                    }
                ],
                display_key: 'name',
                value_key: 'value'
            }
        }
    ], " AND type='post' ");

    // Find all posts
    __models.posts.findAndCountAll({
        include: [
            {
                model: __models.user, attributes: ['display_name'],
                where: '1 = 1'
            }
        ],
        where: filter.values,
        order: filter.sort,
        limit: config.pagination.number_item,
        offset: (page - 1) * config.pagination.number_item
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / config.pagination.number_item);

        // Render view
        _module.render(req, res, '/post/index', {
            title: "Danh sách bài viết",
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);

        // Render view if has error
        _module.render(req, res, '/post/index', {
            title: "Danh sách bài viết",
            totalPage: 1,
            items: null,
            currentPage: page
        });
    });
};

_module.listAll = function (req, res) {
    let query = req.param('query') || "";
    query = query.toLowerCase();

    __models.posts.findAll({
        where: 'LOWER(title) like \'%' + query + '%\' AND type=\'post\'',
        order: 'title asc'
    }).then(function (tags) {
        let data = [];
        if (tags.length > 0) {
            tags.forEach(function (t) {
                data.push({value: t.title, data: t.id});
            });
        }

        let result = {query: query, suggestions: data};
        res.json(result);
    });
};

_module.view = function (req, res) {
    res.locals.backButton = __acl.addButton(req, route, 'post_index', '/admin/blog/posts/page/1');
    res.locals.saveButton = __acl.addButton(req, route, 'post_edit');
    res.locals.deleteButton = __acl.addButton(req, route, 'post_delete');

    Promise.all([
        __models.category.findAll({
            order: "id asc"
        }),
        __models.user.findAll({
            order: "id asc"
        }),
        __models.posts.find({
            include: [__models.user],
            where: {
                id: req.params.cid
            }
        })
    ]).then(function (results) {
        res.locals.viewButton = 'posts/' + results[2].id + '/' + results[2].alias;
        let data = results[2];
        data.full_text = data.full_text.replace(/&lt/g, "&amp;lt");
        data.full_text = data.full_text.replace(/&gt/g, "&amp;gt");
        _module.render(req, res, edit_view, {
            title: "Cập nhật bài viết",
            categories: results[0],
            users: results[1],
            post: data,
            seo_enable: __seo_enable,
            seo_info: encodeURIComponent(data.seo_info) || ''
        });
    });
};

_module.update = function (req, res, next) {
    res.locals.backButton = __acl.addButton(req, route, 'post_index', '/admin/blog/posts/page/1')
    res.locals.saveButton = __acl.addButton(req, route, 'post_edit');
    res.locals.deleteButton = __acl.addButton(req, route, 'post_delete');

    let data = req.body;
    data.seo_info = decodeURIComponent(data.seo_info);

    data.author_visible = (data.author_visible != null);

    if (!data.published) data.published = 0;
    __models.posts.find(req.params.cid).then(function (post) {

        let tag = post.categories;
        if (tag != null && tag != '') {
            tag = tag.split(':');
            tag.shift();
            tag.pop(tag.length - 1);
        } else tag = [];

        let newtag = data.categories;
        if (newtag != null && newtag != '') {
            newtag = newtag.split(':');
            newtag.shift();
            newtag.pop(newtag.length - 1);
        } else newtag = [];

        /**
         * Update count for category
         */
        let onlyInA = [],
            onlyInB = [];

        if (Array.isArray(tag) && Array.isArray(newtag)) {
            onlyInA = tag.filter(function (current) {
                return newtag.filter(function (current_b) {
                        return current_b == current
                    }).length == 0
            });

            onlyInB = newtag.filter(function (current) {
                return tag.filter(function (current_a) {
                        return current_a == current
                    }).length == 0
            });
        }

        if (data.published != post.published && data.published == 1) data.published_at = __models.sequelize.fn('NOW');

        post.updateAttributes(data).on('success', function () {
            Promise.all([
                function () {
                    return new Promise(function (fulfill, reject) {
                        if (onlyInA.length > 0) {
                            onlyInA.forEach(function (id) {
                                __models.category.find(id).then(function (tag) {
                                    let count = +tag.count - 1;
                                    tag.updateAttributes({
                                        count: count
                                    }).on('success', function (data) {
                                        fulfill(data);
                                    });
                                });
                            });
                        }
                    })
                }, function () {
                    return new Promise(function (fulfill, reject) {
                        if (onlyInB.length > 0) {
                            onlyInB.forEach(function (id) {
                                __models.category.find(id).then(function (tag) {
                                    let count = +tag.count + 1;
                                    tag.updateAttributes({
                                        count: count
                                    }).on('success', function () {
                                        //console.log(chalk.green('Update category ' + tag.id + ': count+1 success'));
                                    });
                                });
                            });
                        }
                    })
                }
            ]).then(function (data) {
                req.flash.success("Cập nhật bài viết thành công");
                next();
            })
        });
    });
};

_module.create = function (req, res) {
    res.locals.backButton = __acl.addButton(req, route, 'post_index', '/admin/blog/posts/page/1')
    res.locals.saveButton = __acl.addButton(req, route, 'post_create');

    Promise.all([
        __models.category.findAll({
            order: "id asc"
        }),
        __models.user.findAll({
            order: "id asc"
        })
    ]).then(function (results) {
        _module.render(req, res, edit_view, {
            title: "Thêm bài viết",
            categories: results[0],
            users: results[1]
        });
    });
};

_module.save = function (req, res) {
    let data = req.body;
    data.created_by = req.user.id;
    data.alias = slug(data.title).toLowerCase();
    data.type = 'post';
    if (!data.published) data.published = 0;
    if (data.published == 1) data.published_at = __models.sequelize.fn('NOW');

    __models.posts.create(data).then(function (post) {
        let tag = post.cat_id;
        if (tag != null && tag != '') {
            tag = tag.split(':');
            tag.shift();
            tag.pop(tag.length - 1);

            if (tag.length > 0) {
                tag.forEach(function (id) {
                    __models.category.find(id).then(function (cat) {
                        let count = +cat.count + 1;
                        cat.updateAttributes({
                            count: count
                        }).on('success', function () {
                            //console.log(chalk.green('Update cat ' + cat.id + ': count+1 success'));
                        });
                    });
                });
            }
        }
        req.flash.success('Thêm bài viết mới thành công');
        res.redirect('/admin/blog/posts/' + post.id);
    }).catch(function (err) {
        req.flash.error(err.message);
        res.redirect('/admin/blog/posts/create');
    });
};

_module.delete = function (req, res) {
    __models.posts.findAll({
        where: {
            id: {
                in: req.param('ids').split(',')
            }
        }
    }).then(function (posts) {
        posts.forEach(function (post) {
            let tag = post.categories;
            if (tag != null && tag != '') {
                tag = tag.split(':');
                tag.shift();
                tag.pop(tag.length - 1);

                if (tag.length > 0) {
                    tag.forEach(function (id) {
                        __models.category.find(id).then(function (cat) {
                            let count = +cat.count - 1;
                            cat.updateAttributes({
                                count: count
                            }).on('success', function () {
                                //console.log(chalk.green('Update cat ' + cat.name + ': count-1 success'));
                            });
                        });
                    });
                }
            }
            __models.posts.destroy({
                where: 'id=' + post.id
            });
        });
        req.flash.success('Xóa bài viết thành công');
        res.send(200);
    });
};

_module.read = function (req, res, next, id) {
    __models.posts.find({
        where: {
            id: id
        }
    }).then(function (post) {
        req.post = post;
        next();
    });
};

/**
 * Post authorization middleware
 */
_module.hasAuthorization = function (req, res, next) {
    return (req.post.created_by !== req.user.id);
};

util.inherits(PostsModule, BaseModuleBackend);
module.exports = _module;