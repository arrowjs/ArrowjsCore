'use strict';

let util = require('util'),
    _ = require('lodash');

let fs = require('fs');

let promise = require('bluebird');

let writeFileAsync = promise.promisify(require('fs').writeFile);

let formidable = require('formidable');
promise.promisifyAll(formidable);

let redis = require('redis').createClient();

let path = require('path');
let slug = require('slug');

let edit_template = 'new.html';
let folder_upload = '/img/users/';
let route = 'users';
let breadcrumb =
    [
        {
            title: 'Home',
            icon: 'fa fa-dashboard',
            href: '/admin'
        },
        {
            title: 'Users',
            href: '/admin/users'
        }
    ];

function UsersModule() {
    BaseModuleBackend.call(this);
    this.path = "/users";
}
let _module = new UsersModule();

_module.list = function (req, res) {
    // Add button
    res.locals.createButton = __acl.addButton(req, route, 'create', '/admin/users/create');

    // Breadcrumb
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb);

    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'asc';
    //config columns
    res.locals.root_link = '/admin/users/page/' + page + '/sort';
    let filter = __.createFilter(req, res, route, '/admin/users', column, order, [
        {
            column: "id",
            width: '8%',
            header: "Id",
            filter: {
                model: 'user',
                data_type: 'number'
            }

        },
        {
            column: "display_name",
            width: '15%',
            header: "Full Name",
            link: '/admin/users/{id}',
            acl: 'users.update',
            filter: {
                data_type: 'string'
            }

        },
        {
            column: "user_login",
            width: '15%',
            header: "UserName",
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "user_email",
            width: '15%',
            header: "Email",
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "phone",
            width: '12%',
            header: "Phone",
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "role.name",
            width: '10%',
            header: "Role",
            link: '/admin/roles/{role.id}',
            filter: {
                type: 'select',
                filter_key: 'role_id',
                data_source: 'arr_role',
                display_key: 'name',
                value_key: 'id'
            }
        },
        {
            column: "",
            link: "#",
            alias: "Chi tiết",
            width: '10%',
            header: "Registered course",
            onclick: 'viewCourse(\'{user_email}\');',
        },
        {
            column: "user_status",
            width: '10%',
            header: "Status",
            filter: {
                type: 'select',
                filter_key: 'user_status',
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

    // console.log(filter.attributes);

    // List users
    __models.user.findAndCountAll({
        attributes: filter.attributes,
        include: [
            {
                model: __models.role
            }
        ],
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item,
        where: filter.values
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);
        _module.render(req, res, 'index.html', {
            title: "Danh sách thành viên",
            totalPage: totalPage,
            items: results.rows,
            currentPage: page

        });

    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'index.html', {
            title: "Danh sách thành viên",
            totalPage: 1,
            users: null,
            currentPage: 1
        });
    });
};

_module.view = function (req, res) {
    // Add button
    res.locals.saveButton = __acl.addButton(req, route, 'create');
    res.locals.backButton = __acl.addButton(req, route, 'index', '/admin/users');

    // Breadcrumb
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb, {title: 'Update User'});
    // Get user by session and list roles
    __models.role.findAll().then(function (roles) {
        _module.render(req, res, edit_template, {
            title: "Cập nhật thành viên",
            roles: roles,
            user: req._user,
            id: req.params.cid
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, edit_template, {
            title: "Cập nhật thành viên",
            roles: null,
            users: null,
            id: 0
        });
    });
};

_module.course_of = function (req, res) {
    let email = req.params.email;
    __models.customer_register.findAll({
        include: [{
            model: __models.course, attributes: [
                'title'
            ]
        }],
        where: {
            email: email
        },
        attributes: ['full_name', 'email', 'register_date']
    }).then(function (results) {
        res.json(results);
    }).catch(function (err) {
        req.flash.error("Error: ", err.stack);
    })
};

_module.update = function (req, res, next) {
    let edit_user = null;
    let data = req.body;
    // Get user by id
    __models.user.find({
        where: {
            id: req.params.cid
        },
        include: [
            {
                model: __models.users_info
            }
        ]
    }).then(function (user) {
        edit_user = user;
        return new Promise(function (fulfill, reject) {
            if (data.base64 && data.base64 != '' && data.base64 != user.user_image_url) {
                let fileName = folder_upload + slug(user.user_login).toLowerCase() + '.png';
                let base64Data = data.base64.replace(/^data:image\/png;base64,/, "");
                return writeFileAsync(__base + 'public' + fileName, base64Data, 'base64').then(function () {
                    data.user_image_url = fileName;
                    fulfill(data);
                }).catch(function (err) {
                    reject(err);
                });
            } else fulfill(data);
        })
    }).then(function (data) {
        let info = {
            user_biology: data.user_biology,
            user_blog_url: data.user_blog_url
        };

        return promise.all([
            edit_user.updateAttributes(data),
            __models.users_info.find({
                where: {
                    user_id: edit_user.id
                }
            }).then(function (user_info) {
                return user_info.updateAttributes(info)
            })
        ]).then(function () {
            req.flash.success("Update user successfully");
            if (req.url.indexOf('profile') !== -1) return res.redirect('/admin/users/profile/' + req.params.cid);
            return res.redirect('/admin/users/' + req.params.cid);
        });
    }).catch(function (error) {
        //console.log(error);
        if (error.name == 'SequelizeUniqueConstraintError') {
            req.flash.error('Email already exist');
            return next();
        } else {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            return next();
        }
    });
};

_module.create = function (req, res) {
    // Add button
    res.locals.saveButton = __acl.addButton(req, route, 'create');
    res.locals.backButton = __acl.addButton(req, route, 'index', '/admin/users');

    // Breadcrumb
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb, {title: 'New User'});

    // Get list roles
    __models.role.findAll({
        order: "id asc"
    }).then(function (roles) {
        _module.render(req, res, edit_template, {
            title: "Thêm thành viên",
            roles: roles
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, edit_template, {
            title: "Thêm thành viên",
            roles: null
        });
    });
};

_module.save = function (req, res, next) {
    // Get form data
    var data = req.body;

    return new Promise(function (fulfill, reject) {
        data.course_view = "Chi tiết";
        if (data.base64 && data.base64 != '') {
            let fileName = folder_upload + slug(data.user_login).toLowerCase() + '.png';
            let base64Data = data.base64.replace(/^data:image\/png;base64,/, "");

            return writeFileAsync(__base + 'public' + fileName, base64Data, 'base64').then(function () {
                data.user_image_url = fileName;

                fulfill(data);
            }).catch(function (err) {
                reject(err);
            });
        } else fulfill(data);
    }).then(function (data) {
            __models.user.create(data).then(function (user) {
                let info = {
                    user_id: user.id
                };
                if (data.user_biology && data.user_biology != '') info.user_biology = data.user_biology;
                if (data.user_blog_url && data.user_blog_url != '') info.user_blog_url = data.user_blog_url;
                return __models.users_info.create(info)
            }).then(function () {
                req.flash.success("Add new user successfully");
                res.redirect('/admin/users/');
            }).catch(function (error) {
                if (error.name == 'SequelizeUniqueConstraintError') {
                    req.flash.error('Email already exist');
                    res.redirect('/admin/users/');
                } else {
                    req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
                    res.redirect('/admin/users/');
                }
            });
        })
};

_module.delete = function (req, res) {
    // Check delete current user
    let ids = req.body.ids;
    let id = req.user.id;
    let index = ids.indexOf(id);

    // Delete user
    if (index == -1) {
        __models.users_info.destroy({
            where: {
                user_id: {
                    "in": ids.split(',')
                }
            }
        }).then(function () {
            __models.user.destroy({
                where: {
                    id: {
                        "in": ids.split(',')
                    }
                }
            }).then(function () {
                req.flash.success("Delete user successfully");
                res.sendStatus(204);
            })
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.sendStatus(200);
        });

    } else {
        req.flash.warning("Cannot delete current user");
        res.sendStatus(200);
    }
};

/**
 * Signout
 */
_module.signout = function (req, res) {
    let key = req.user.key;
    redis.del(key);
    req.logout();
    res.redirect('/admin/login');
};

/**
 * Profile
 */
_module.profile = function (req, res) {
    // Add button
    res.locals.saveButton = __acl.addButton(req, route, 'update_profile');
    //breadcrumb
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb, {title: 'Profile'});

    //console.log(req.user, '##################', req._user);
    __models.role.findAll({
        order: "id asc"
    }).then(function (roles) {
        _module.render(req, res, 'new.html', {
            user: req._user,
            roles: roles
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'new.html', {
            user: null,
            roles: null
        });
    });
};

/**
 * Change pass view
 */
_module.changePass = function (req, res) {
    res.locals.breadcrumb = __.create_breadcrumb(breadcrumb, {title: 'Change password'});
    _module.render(req, res, 'change-pass', {
        user: req.user
    });
};

/**
 * Update pass view
 */
_module.updatePass = function (req, res) {
    let old_pass = req.body.old_pass;
    let user_pass = req.body.user_pass;
    __models.user.find(req.user.id).then(function (user) {
        if (user.authenticate(old_pass)) {
            user.updateAttributes({
                user_pass: user.hashPassword(user_pass)
            }).then(function () {
                req.flash.success("Changed password successful");
            }).catch(function (error) {
                req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            }).finally(function () {
                _module.render(req, res, 'change-pass');
            });
        }
        else {
            req.flash.warning("Password invalid");
            _module.render(req, res, 'change-pass');
        }
    });
};

_module.saveOAuthUserProfile = function (req, profile, done) {
    __models.user.find({
        where: {
            user_email: profile.user_email
        }
    }).then(function (user) {
        if (user) {
            if (user.role_id !== profile.role_id) {
                profile.role_id = user.role_id
            }
            user.updateAttributes(profile).then(function (user) {
                return done(null, user);
            });
        }
        else {
            __models.user.create(profile).then(function (user) {
                return done(null, user);
            })
        }
    })
};

_module.userById = function (req, res, next, id) {
    __models.user.find({
        include: [
            {
                model: __models.role
            },
            {
                model: __models.users_info
            }
        ],
        where: {
            id: id
        }
    }).then(function (user) {
        req._user = user;
        next();
    })
};

_module.hasAuthorization = function (req, res, next) {
    if (req._user.id !== req.user.id) {
        return false;
    }
    return true;
};

util.inherits(UsersModule, BaseModuleBackend);
module.exports = _module;