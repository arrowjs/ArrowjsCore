'use strict';

let promise = require('bluebird');
let route = 'blog';
let config = require(__base + 'config/config');
let util = require('util');
let slug = require('slug');
let formidable = require('formidable');
let sequelize = require('sequelize');
promise.promisifyAll(formidable);

function PagesModule() {
    BaseModuleBackend.call(this);
    this.path = "/blog";
}
let _module = new PagesModule;

_module.list = function (req, res) {
    // Add buttons
    res.locals.createButton = __acl.addButton(req, route, 'page_create', '/admin/blog/pages/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'page_delete');

    // Get current page and default sorting
    let page = req.params.page || 1;
    let column = req.params.sort || 'created_by';
    let order = req.params.order || 'desc';
    res.locals.root_link = '/admin/blog/pages/page/' + page + '/sort';

    // Create filter
    let filter = __.createFilter(req, res, route, '/admin/blog/pages', column, order, [
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
            link: '/admin/blog/pages/{id}',
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
                filter_key: 'created_by'
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
    ], " AND type='page' ");

    // List pages
    __models.post.findAndCountAll({
        include: [
            {
                model: __models.user, attributes: ['display_name'],
                where: ['1 = 1']
            }
        ],
        where: filter.values,
        order: filter.sort,
        limit: config.pagination.number_item,
        offset: (page - 1) * config.pagination.number_item
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / config.pagination.number_item);

        // Render view
        _module.render(req, res, '/page/index', {
            title: "Danh sách page",
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);

        // Render view if has error
        _module.render(req, res, '/page/index', {
            title: "Danh sách page",
            totalPage: 1,
            items: null,
            currentPage: page
        });
    });
};

_module.listAll = function (req, res) {
    let query = req.param('query') || '';
    query = query.toLowerCase();

    __models.post.findAll({
        where: ["type='page' AND LOWER(title) like '%" + query + "%'"],
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

_module.redirectToView = function (req, res) {
    __models.post.find({
        where: {
            alias: req.params.name
        }
    }).then(function (page) {
        res.redirect('/admin/blog/pages/' + page.id);
    }).catch(function (err) {
        res.redirect('/404.html');
    })
};

_module.view = function (req, res) {
    res.locals.backButton = __acl.addButton(req, route, 'page_index', '/admin/blog/pages/page/1');
    res.locals.saveButton = __acl.addButton(req, route, 'page_edit');
    res.locals.deleteButton = __acl.addButton(req, route, 'page_delete');

    promise.all([
        __models.user.findAll({
            order: "id asc"
        }),
        __models.post.find({
            include: [__models.user],
            where: {
                id: req.params.cid,
                type: 'page'
            }
        })
    ]).then(function (results) {
        res.locals.viewButton = 'trungtam/' + results[1].alias;
        _module.render(req, res, 'page/new', {
            title: "Cập nhật page",
            users: results[0],
            page: results[1]
        });
    });
};
_module.update = function (req, res, next) {
    res.locals.saveButton = __acl.addButton(req, route, 'page_edit');
    res.locals.backButton = __acl.addButton(req, route, 'page_index', '/admin/blog/pages/page/1')
    res.locals.deleteButton = __acl.addButton(req, route, 'page_delete');

    let data = req.body;
    if (!data.published) data.published = 0;
    data.modified_date = data.modified_date_gmt = sequelize.fn('NOW');

    __models.post.find({
        include: [__models.user],
        where: {
            id: req.params.cid
        }
    }).then(function (page) {
        page.updateAttributes(data).then(function () {
            res.locals.viewButton = 'trungtam/' + page.alias;
            req.messages = req.flash.success("Cập nhật page thành công");
            _module.render(req, res, 'page/new', {
                title: "Cập nhật page",
                page: page
            });
        });
    });
};

_module.create = function (req, res) {
    res.locals.saveButton = __acl.addButton(req, route, 'page_create');
    res.locals.backButton = __acl.addButton(req, route, 'page_index', '/admin/blog/pages/page/1')

    __models.user.findAll({
        order: "id asc"
    }).then(function (results) {
        _module.render(req, res, 'page/new', {
            title: "Tạo page",
            users: results
        });
    });
};

_module.save = function (req, res) {
    res.locals.saveButton = __acl.addButton(req, route, 'page_edit');
    res.locals.backButton = __acl.addButton(req, route, 'page_index', '/admin/blog/pages/page/1');
    res.locals.deleteButton = __acl.addButton(req, route, 'page_delete');

    let data = req.body;
    data.alias = slug(data.title).toLowerCase();
    data.created_by = req.user.id;
    data.type = 'page';
    if (!data.published) data.published = 0;

    __models.post.create(data).then(function (page) {
        req.flash.success('Thêm page mới thành công');
        res.redirect('/admin/blog/pages/' + page.id);
    });
};

_module.delete = function (req, res) {
    __models.post.destroy({
        where: {
            id: {
                "in": req.body.ids.split(',')
            }
        }
    }).then(function () {
        req.flash.success('Xóa trang thành công');
        res.send(200);
    });
};

util.inherits(PagesModule, BaseModuleBackend);
module.exports = _module;