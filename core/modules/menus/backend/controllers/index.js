'use strict';

let _ = require('lodash');
let promise = require('bluebird');

let _module = new BackModule('menus');
let route = 'menus';

_module.index = function (req, res) {
    // Add button
    res.locals.createButton = __acl.addButton(req, route, 'create', '/admin/menus/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'delete');

    // Config ordering
    let column = req.params.sort || 'id';
    let order = req.params.order || '';
    res.locals.root_link = '/admin/menus/sort';

    // Config columns
    __.createFilter(req, res, '', '/admin/menus', column, order, [
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
            link: '/admin/menus/update/{id}',
            acl: 'users.update'
        }
    ]);

    __models.menus.findAll({
        order: column + " " + order,
        raw: true
    }).then(function (menus) {
        // Render view
        _module.render(req, res, 'index', {
            title: "All Menus",
            items: menus
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        // Render view if has error
        _module.render(req, res, 'index', {
            title: "All Menus",
            menus: null
        });
    });
};

_module.create = function (req, res) {
    // Add buttons
    res.locals.saveButton = __acl.addButton(req, route, 'create');
    res.locals.backButton = __acl.addButton(req, route, 'index', '/admin/menus');

    // Get module links
    res.locals.setting_menu_module = __setting_menu_module;

    // Render view
    _module.render(req, res, 'new', {
        title: 'Tạo mới menu'
    });
};

_module.save = function (req, res) {
    let menu_id = 0;

    // Create menu
    __models.menus.create({
        name: req.body.name,
        status: 'publish',
        menu_order: req.body.output
    }).then(function (menu) {
        menu_id = menu.id;

        // Delete old menu detail
        return __models.menu_detail.destroy({
            where: {
                menu_id: menu_id
            }
        });
    }).then(function () {
        let promises = [];

        // Create menu detail
        for (let i in req.body.title) {
            promises.push(
                __models.menu_detail.create({
                    id: req.body.mn_id[i],
                    menu_id: menu_id,
                    name: req.body.title[i],
                    link: req.body.url[i],
                    attribute: req.body.attribute[i],
                    status: 'publish'
                })
            );
        }

        return promise.all(promises);
    }).then(function () {
        req.flash.success('New menu was created successfully');

        // After create menu successfully, go to edit page
        res.redirect('/admin/menus/update/' + menu_id);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);

        // Re-render view if has error
        _module.render(req, res, 'new');
    });
};

_module.read = function (req, res) {
    // Add buttons
    res.locals.backButton = __acl.addButton(req, route, 'index', '/admin/menus');

    // Get module links
    res.locals.setting_menu_module = __setting_menu_module;

    // Render view
    _module.render(req, res, 'new', {
        title: 'Cập nhật menu'
    });
};

_module.update = function (req, res) {
    // Find menu to update
    __models.menus.find({
        where: {
            id: req.params.cid
        }
    }).then(function (menu) {
        // Update menu
        return menu.updateAttributes({
            name: req.body.name,
            menu_order: req.body.output
        });
    }).then(function (menu) {
        // Delete old menu detail
        return __models.menu_detail.destroy({
            where: {
                menu_id: menu.id
            }
        });
    }).then(function () {
        let promises = [];

        // Create menu detail
        for (let i in req.body.title) {
            promises.push(
                __models.menu_detail.create({
                    id: req.body.mn_id[i],
                    menu_id: req.params.cid,
                    name: req.body.title[i],
                    link: req.body.url[i],
                    attribute: req.body.attribute[i],
                    status: 'publish'
                })
            );
        }

        return promise.all(promises);
    }).then(function () {
        req.flash.success('Updated successfully');
        // After update menu successfully, redirect to edit page
        res.redirect('/admin/menus/update/' + req.params.cid);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'new');
    });
};

_module.menuById = function (req, res, next, id) {
    __models.menus.findById(id).then(function (menu) {
        res.locals.menu = menu;
        return __models.menu_detail.findAll({
            where: {
                menu_id: id
            },
            raw: true
        });
    }).then(function (menu_details) {
        res.locals.menu_details = JSON.stringify(menu_details);
        next();
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        next();
    });
};

_module.sortAdminMenu = function (req, res) {
    res.locals.saveButton = __acl.addButton(req, route, 'update');
    _module.render(req, res, 'admin_sort', {
        title: "Sorting Admin Menu",
        menus: __menus,
        messages: req.messages || []
    });
};

_module.saveSortAdminMenu = function (req, res) {
    let redis = require("redis").createClient();
    let systems = req.body.s || [];
    let defaults = req.body.d || [];
    //Them button
    if (systems.length > 0) {
        __menus.sorting.systems = systems;
    }
    if (defaults.length > 0) {
        __menus.sorting.default = defaults;
    }
    redis.set(__config.redis_prefix + 'backend_menus', JSON.stringify(__menus), redis.print);
    res.sendStatus(200);
};

_module.delete = function (req, res) {
    __models.menus.destroy({
        where: {
            id: {
                "in": req.body.ids.split(',')
            }
        }
    }).then(function () {
        req.flash.success("Delete menu successfully");
        res.sendStatus(204);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.sendStatus(200);
    });
};

_module.menuitem = function (req, res) {
    _module.render(req, res, 'menuitem');
};

module.exports = _module;
