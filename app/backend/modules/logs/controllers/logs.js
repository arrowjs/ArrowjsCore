'use strict';

/**
 * Module dependencies.
 */
let chalk = require('chalk'),
    _ = require('lodash'),
    path = require('path'),
    util = require('util');
let config = require(__base + 'config/config');
let route = 'logs';

/**
 * job middleware
 */
function LogsModule() {
    BaseModuleBackend.call(this);
    this.path = "/logs";
}
let _module = new LogsModule();


_module.view = function (req, res) {
    res.locals.saveButton = __acl.addButton(req, route, 'update');
    res.locals.deleteButton = __acl.addButton(req, route, 'delete');
    res.locals.backButton = __acl.addButton(req, route, 'index', '/admin/logs');
    let id = req.params.id;

    __models.logs.find(id).then(function (log) {
        _module.render(req, res, 'new', {
            log: log,
            title: 'Cập nhật log'
        });
    }).catch(function(err) {
        req.flash.error(err.name + ': ' + err.message);
        redirect('/admin/logs');
    });
};

_module.create = function (req, res) {
    res.locals.saveButton = __acl.addButton(req, route, 'create');
    res.locals.backButton = __acl.addButton(req, route, 'index', '/admin/logs');
    Promise.all([
        __models.job_skill.findAll({
            order: 'name asc'
        }),
        __models.job_location.findAll({
            order: 'title asc'
        })
    ]).then(function (results) {
        _module.render(req, res, 'new', {
            logskills: results[0],
            jobLocations: results[1],
            title: 'Thêm log'
        });
    });

};

_module.save = function (req, res, next) {
    let data = req.body;
    __models.logs.create(data).then(function () {
        req.flash.success("Thêm log thành công");
        next();
    }).catch(function (err) {
        req.flash.error(err.name + ': ' + err.message);
        next();
    });
};

/**
 * Update a job
 */
_module.update = function (req, res) {
    let data = req.body;
    __models.logs.find({
        where: {
            id: req.params.id
        }
    }).then(function (log) {
        log.updateAttributes(data).then(function (log) {
            req.flash.success("Cập nhật thành công");
            res.redirect('/admin/logs/' + log.id);

        }).catch(function (err) {
            req.flash.error(err.name + ': ' + err.message);
        });
    });
};

/**
 * Delete an job
 */
_module.delete = function (req, res) {
    __models.logs.destroy({
        where: {
            id: {
                'in': req.param('ids').split(',')
            }
        }
    }).then(function () {
        req.flash.success("Deleted log(s) successfully.");
        res.send(200);
    });
};

/**
 * List of logs
 */
_module.list = function (req, res) {
    //Them button
    res.locals.createButton = __acl.addButton(req, route, 'create', '/admin/logs/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'delete');

    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'desc';
    res.locals.root_link = '/admin/logs/page/' + page + '/sort';
    //Config columns
    let filter = __.createFilter(req, res, route, '/admin/logs', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: "type",
            width: '3%',
            header: "Loại",
            type: 'custom',
            alias: {
                "0": '<span class="badge label-danger"><i class="fa fa-warning"></i></span>',
                "1": '<span class="badge label-success"><i class="fa fa-check"></i></span>'
            },
            filter: {
                type: 'select',
                filter_key: 'type',
                data_source: [
                    {
                        name: "Lỗi",
                        value: 0
                    },
                    {
                        name: "Thành công",
                        value: 1
                    }
                ],
                display_key: 'name',
                value_key: 'value'
            }
        },
        {
            column: "event_name",
            width: '10%',
            header: "Tên",
            link: '/admin/logs/{id}',
            acl: 'logs.update',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "created_at",
            type: 'datetime',
            width: '10%',
            header: "Thời gian",
            filter: {
                type: 'datetime'
            }
        },
        {
            column: "message",
            header: "Nội dung",
            filter: {
                data_type: 'string'
            }
        }
    ]);

        __models.logs.findAndCountAll({
            where: filter.values,
            order: column + " " + order,
            limit: config.pagination.number_item,
            offset: (page - 1) * config.pagination.number_item
        }).then(function (logs) {
            let totalPage = Math.ceil(logs.count / config.pagination.number_item);
            _module.render(req, res, 'index', {
                title: "Logs hệ thống",
                items: logs.rows,
                currentPage: page,
                totalPage: totalPage
            });
        });

};

util.inherits(LogsModule, BaseModuleBackend);
module.exports = _module;