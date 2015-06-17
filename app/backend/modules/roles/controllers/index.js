'use strict'
/**
 * Created by thanhnv on 1/26/15.
 */
let util = require('util'),
    _ = require('lodash');
let fs = require('fs');
let path = require('path');

let route = 'roles';
let breadcrumb =
    [
        {
            title: 'Home',
            icon: 'fa fa-dashboard',
            href: '/admin'
        },
        {
            title: 'Roles',
            href: '/admin/roles'
        }
    ];

function RolesModule() {
    BaseModuleBackend.call(this);
    this.path = "/roles";
}
let _module = new RolesModule();

_module.list = function (req, res) {
    // Add button
    res.locals.createButton = __acl.addButton(req, route, 'create', '/admin/roles/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'delete');

    // Breadcrumb
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb);

    //Config ordering
    let column = req.params.sort || 'id';
    let order = req.params.order || '';
    res.locals.root_link = '/admin/roles/sort';
    //Config columns
    let filter = __.createFilter(req, res, route, '/admin/roles', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: "name",
            width: '25%',
            header: "Name",
            link: '/admin/roles/{id}',
            acl: 'users.update',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "modified_at",
            type: 'datetime',
            width: '10%',
            header: "Modified Date",
            filter: {
                type: 'datetime'
            }
        },
        {
            column: "status",
            width: '15%',
            header: "Status",
            filter: {
                type: 'select',
                filter_key: 'status',
                data_source: [
                    {
                        name: "publish"
                    },
                    {
                        name: "un-publish"
                    }
                ],
                display_key: 'name',
                value_key: 'name'
            }
        }
    ]);
    // List roles
    __models.role.findAll({
        where: filter.values,
        order: column + " " + order

    }).then(function (roles) {
        _module.render(req, res, 'index', {
            title: "All Roles",
            items: roles
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'index', {
            title: "All Roles",
            roles: null
        });
    });
};

_module.view = function (req, res) {
    // Add button
    res.locals.saveButton = __acl.addButton(req, route, 'update');
    res.locals.backButton = __acl.addButton(req, route, 'index', '/admin/roles');

    // Breadcrumb
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb, {title: 'Update Role'});

    // Get role by id
    __models.role.find({
        where: {
            id: req.params.cid
        }
    }).then(function (roles) {
        _module.render(req, res, 'new', {
            title: "Update Role",
            modules: __modules,
            role: roles,
            f_modules: __f_modules,
            rules: JSON.parse(roles.rules),
            f_rules: JSON.parse(roles.f_rules)
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'new', {
            title: "Update Role",
            modules: __modules,
            f_modules: __f_modules,
            role: null,
            rules: null
        });
    });
};

_module.update = function (req, res) {
    // Get role by id
    __models.role.find({
        where: {
            id: req.params.cid
        }
    }).then(function (role) {
        let rules = {};
        let f_rules = {};
        for (let k in req.body) {
            if (req.body.hasOwnProperty(k)) {
                if (k != 'title' && k != 'status' && k.indexOf('f_') < 0) {
                    rules[k] = req.body[k].join(':');
                }
                else if (k.indexOf('f_') == 0) {
                    f_rules[k.replace('f_', '')] = req.body[k].join(':');
                }
            }
        }

        // Update role
        return role.updateAttributes({
            name: req.body.title,
            status: req.body.status,
            rules: JSON.stringify(rules),
            f_rules: JSON.stringify(f_rules)
        });
    }).then(function () {
        req.flash.success('Update role successfully');
        res.redirect('/admin/roles/');
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect('/admin/roles/');
    });
};

_module.create = function (req, res) {
    // Add button
    res.locals.saveButton = __acl.addButton(req, route, 'create');
    res.locals.backButton = __acl.addButton(req, route, 'index', '/admin/roles');

    // Breadcrumb
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb, {title: 'Add New'});

    _module.render(req, res, 'new', {
        title: "New Role",
        modules: __modules,
        f_modules: __f_modules
    });
};

_module.save = function (req, res) {
    let rules = {};
    let f_rules = {};
    for (let k in req.body) {
        if (req.body.hasOwnProperty(k)) {
            if (k != 'title' && k != 'status' && k.indexOf('f_') < 0) {
                rules[k] = req.body[k].join(':');
            }
            else if (k.indexOf('f_') == 0) {
                f_rules[k.replace('f_', '')] = req.body[k].join(':');
            }
        }
    }

    // Create role
    __models.role.create({
        name: req.body.title,
        status: req.body.status,
        rules: JSON.stringify(rules),
        f_rules: JSON.stringify(f_rules)
    }).then(function () {
        req.flash.success('Create new role successfully');
        res.redirect('/admin/roles/');
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect('/admin/roles/');
    });
};

_module.delete = function (req, res) {
    // Delete role
    __models.role.destroy({
        where: {
            id: {
                "in": req.body.ids.split(',')
            }
        }
    }).then(function () {
        req.flash.success("Delete role successfully");
        res.sendStatus(204);
    }).catch(function (error) {
        if (error.name == 'SequelizeForeignKeyConstraintError') {
            req.flash.error('Cannot delete role has already in use');
            res.sendStatus(200);
        } else {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.sendStatus(200);
        }
    });
};

util.inherits(RolesModule, BaseModuleBackend);
module.exports = _module;