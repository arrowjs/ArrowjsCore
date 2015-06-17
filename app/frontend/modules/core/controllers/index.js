/**
 * Created by thanhnv on 2/17/15.
 */
'use strict';
/**
 * Module dependencies.
 */

let Joi = require('joi');
let passport = require('passport');
let promise = require('bluebird');
let writeFileAsync = promise.promisify(require('fs').writeFile);
let readdirAsync = promise.promisify(require('fs').readdir);
let mailer = require('nodemailer');
let folder_upload = '/img/users/';
let formidable = require('formidable');
let slug = require('slug');
let path = require('path');
let randomBytesAsync = promise.promisify(require('crypto').randomBytes);
promise.promisifyAll(formidable);
let config = require(__base + 'config/config.js'),
    redis = require('redis').createClient(),
    _ = require('lodash');

let _module = new ArrModule('core', __dirname);

let schemaSignup = Joi.object().keys({
    username: Joi.string().regex(/[a-zA-Z0-9@]{3,50}/).required(),
    user_pass: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
    confirm_pass: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
    email: Joi.string().email().required(),
    term: Joi.boolean().required()
});

let schemaSignin = Joi.object().keys({
    username: Joi.string().regex(/[a-zA-Z0-9@]{3,50}/).required(),
    user_pass: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
});

_module.dashboard = function (req,res) {
    if (req.user) {
        __models.user_course.findAll({
            where: {
                user_id: req.user.id
            },
            limit : 3
        }).then(function (results) {
            if (results.length > 0) {
                promise.map(results, function (result) {
                    return Promise.all([
                        __models.course.find(result.course_id),
                        __models.user_lesson.count({
                        where: {
                            course_id: result.course_id,
                            user_id: req.user.id
                        }})
                    ]);
                }).then(function (courses) {
                    _module.render(req, res, "dashboard", {courses: courses})
                })
            } else {
                _module.render(req, res, "dashboard", {courses: null});
            }
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.redirect('/khoa-hoc');
        })
    } else {
        res.redirect('/khoa-hoc');
    }
}
_module.signupPage = function (req, res) {
    _module.render(req, res, 'signup');
};

_module.signup = function (req, res) {

    let data = req.body;
    Joi.validate(data, schemaSignup, function (err, value) {
        if (err) {
            console.log(err);
            return _module.render(req, res, 'signup', {
                msg: {
                    type: "error",
                    content: err.message
                }
            });
        } else {
            __models.user.find({
                where: {
                    user_login: data.username
                }
            }).then(function (result) {
                if (result) {
                    return _module.render(req, res, 'signup', {
                        msg: {
                            type: "error",
                            content: "Tên đăng nhập đã tồn tại"
                        }
                    });
                } else {
                    __models.user.find({
                        where: {
                            user_email: data.email
                        }
                    }).then(function (result) {
                        if (result) {
                            return _module.render(req, res, 'signup', {
                                msg: {
                                    type: "error",
                                    content: "Email đã được đăng ký"
                                }
                            });
                        } else {
                            if (data.user_pass === data.confirm_pass && data.user_pass !== "") {
                                let newuser = {
                                    role_id: 21,
                                    user_login: data.username,
                                    display_name: data.username,
                                    user_email: data.email,
                                    user_pass: data.user_pass,
                                    user_status: "un-publish",
                                    user_activation_key: Math.random().toString(36).slice(-8)
                                };
                                let msg_content = '';
                                __models.user.create(newuser)
                                    //.then(function (user) {
                                    //return user.updateAttributes({
                                    //    user_pass: user.hashPassword(data.user_pass)
                                    //});
                                    //})
                                    .then(function (user) {
                                        let info = {
                                            user_id: user.id
                                        };
                                        if (newuser.user_biology && newuser.user_biology != '') info.user_biology = newuser.user_biology;
                                        if (newuser.user_blog_url && newuser.user_blog_url != '') info.user_blog_url = newuser.user_blog_url;
                                        promise.all([
                                            (function () {
                                                _module.getHTML(req, res, 'user-activate-email', {
                                                    name: user.user_email,
                                                    appName: config.app.title,
                                                    url: 'http://' + req.headers.host + '/user/activate/' + user.id + '/' + user.user_activation_key
                                                }, function (err, emailHTML) {
                                                    if (err) {
                                                        console.log(err);
                                                        return promises.cancel();
                                                    } else {
                                                        let mailOptions = {
                                                            to: user.user_email,
                                                            from: config.mailer_config.mailer_from,
                                                            subject: 'Kích hoạt tài khoản tại Techmaster.vn',
                                                            html: emailHTML
                                                        };

                                                        sendMail(mailOptions).catch(function (err) {
                                                            __models.logs.create({
                                                                event_name: 'Send activate account mail',
                                                                message: err.message,
                                                                type: 0 // error
                                                            });
                                                        });
                                                    }
                                                });
                                            })(),
                                            __models.users_info.create(info)
                                        ]).then(function () {
                                            return _module.render(req, res, 'sign', {
                                                msg: {
                                                    content: 'Tạo tài khoản thành công. Email đã được gửi tới ' + user.user_email + ' cùng thông tin tài khoản. Hãy làm theo hướng dẫn trong thư để kích hoạt tài khoản của bạn.'
                                                }
                                            })
                                        })
                                    })
                            } else {
                                return _module.render(req, res, 'signup', {
                                    msg: {
                                        type: "error",
                                        content: "Mật khẩu không khớp"
                                    }
                                });
                            }
                        }

                    })
                }
            })
        }
    });
};

_module.index = function (req, res) {
    _module.render(req, res, "sign")
};

_module.signin = function (req, res, next) {

    passport.authenticate('local', function (err, user, info) {

        let link = "/";

        if (req.headers.origin && req.headers.referer) {
            link += path.relative(req.headers.origin, req.headers.referer);
        } else {
            link = req.headers.referer;
        }

        if (link.indexOf('sign') === -1) {
            req.session.prelink = link;
        }

        if (info) {
            _module.render(req, res, 'sign', {
                msg: {
                    type: "error",
                    content: info.message
                }
            })
        }
        else {
            req.login(user, function (err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    if (req.session.prelink.indexOf('/user/activate') !== -1) req.session.prelink = '/';
                    return res.redirect("/user/dashboard");
                }
            });
        }
    })(req, res, next);
};

_module.signout = function (req, res) {
    if(req.user) {
        let key = req.user.key;
        redis.del(key);
    }
    req.logout();
    res.redirect('/');
};


_module.userProfile = function (req, res) {
    if (req.user) {
        __models.user.find({
            where: {
                id: req.user.id
            },
            include: [
                {
                    model: __models.users_info
                }
            ]
        }).then(function (data) {
            let msg = req.session.msg || null;
            req.session.msg = null;
            _module.render(req, res, 'profile', {
                user: data,
                msg: msg
            })
        })
    } else {
        _module.render(req, res, 'sign', {
            msg: {
                type: "error",
                content: "Xin vui lòng đăng nhập tài khoản!"
            }
        })
    }
};

_module.updateUser = function (req, res, next) {
    let utils = require(__base + 'libs/utils');
    let edit_user = null;
    let data = req.body;
    __models.user.find({
        where: {
            id: req.user.id
        },
        include: [
            {
                model: __models.users_info
            }
        ]
    }).then(function (user) {
        edit_user = user;
        return new Promise(function (fulfill, reject) {
            if(data.base64 && data.base64 != '' && data.base64 != user.user_image_url)
            {
                let fileName = folder_upload + slug(user.user_login).toLowerCase() + '.png';
                let base64Data = data.base64.replace(/^data:image\/png;base64,/, "");
                return writeFileAsync(__base + 'public' + fileName, base64Data, 'base64').then(function() {
                    data.user_image_url = fileName;
                    fulfill(data);
                }).catch(function(err) {
                    reject(err);
                });
            } else fulfill(data);
        })
    }).then(function (data) {
        let info = {
            user_biology: utils.strip_tags(data.user_biology || ''),
            user_blog_url: utils.strip_tags(data.user_blog_url || '')
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
            let key = req.user.key;
            redis.del(key);

            req.session.msg = {
                content: "Cập nhật thông tin thành công!"
            };
            next();
        });
    }).catch(function (error) {
        if (error.name == 'SequelizeUniqueConstraintError') {
            req.session.msg = {
                type: 'error',
                content: error.stack
            };
            next();
        } else {
            req.session.msg = {
                type: 'error',
                content: error.message
            };
            next();
        }
    });
};

_module.updatePass = function (req, res) {

    let old_pass = req.body.old_pass;
    let user_pass = req.body.user_pass;
    __models.user.find({
        where: {
            id: req.user.id
        },
        include: [
            {
                model: __models.users_info
            }
        ]
    }).then(function (user) {
        if (user.authenticate(old_pass)) {
            user.updateAttributes({
                user_pass: user.hashPassword(user_pass)
            }).then(function () {
                _module.render(req, res, 'profile', {
                    user: user,
                    msg: {
                        content: "Password changed"
                    }
                });
            }).catch(function (error) {
                _module.render(req, res, 'profile', {
                    user: user,
                    msg: {
                        type: "error",
                        content: 'Name: ' + error.name + '<br />' + 'Message: ' + error.message
                    }
                });
            })
        }
        else {
            _module.render(req, res, 'profile', {
                user: user,
                msg: {
                    type: "error",
                    content: "Password invalid"
                }
            });
        }
    });
};

_module.forgotPage = function (req, res) {
    _module.render(req, res, 'forget');
};

_module.forgotPass = function (req, res, next) {
    if (!req.body.email) {
        _module.render(req, res, 'forget', {
            msg: {
                type: "error",
                content: 'Email is required'
            }
        });
    }
    let token = '';

    // Generate random token
    let promises = randomBytesAsync(20).then(function (buffer) {
        token = buffer.toString('hex');

        // Lookup user by user_email
        return __models.user.find({
            where: {
                user_email: req.body.email
            }
        });
    }).then(function (user) {
        if (!user) {
            _module.render(req, res, 'forget', {
                msg: {
                    type: "error",
                    content: 'No account with that email has been found'
                }
            });
            return promises.cancel();
        } else {
            // Block spam
            let time = Date.now() + 3600000; // 1 hour 3600000

            if (user.reset_password_expires != null) {
                if (time - user.reset_password_expires < 900000) // 15 minutes
                {
                    let min = 15 - Math.ceil((time - user.reset_password_expires) / 60000);
                    _module.render(req, res, 'forget', {
                        msg: {
                            type: "error",
                            content: 'An reset password email has already been sent. Please try again in ' + min + ' minutes.'
                        }
                    });
                    return promises.cancel();
                }
            }

            // Update user
            let data = {};
            data.reset_password_token = token;
            data.reset_password_expires = time;
            return user.updateAttributes(data)
        }
    }).then(function (user) {
        // Send reset password email

        _module.getHTML(req, res, 'reset-password-email', {
            name: user.display_name,
            appName: config.app.title,
            url: 'http://' + req.headers.host + '/user/reset/' + user.id + '/' + token
        }, function (err, emailHTML) {
            if (err) {
                next(err);
                return promises.cancel();
            } else {
                let mailOptions = {
                    to: user.user_email,
                    from: config.mailer_config.mailer_from,
                    subject: 'Password Reset',
                    html: emailHTML
                };

                return sendMail(mailOptions).then(function (info) {
                    return _module.render(req, res, 'forget', {
                        msg: {
                            content: 'An email has been sent to ' + user.user_email + ' with further instructions. Please follow the guide in email to reset password'
                        }
                    });
                });
            }
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        return next();
    });
};


_module.getReset = function (req, res) {
    __models.user.find({
        where: {
            id: req.params.userid,
            reset_password_token: req.params.token,
            reset_password_expires: {
                $gt: Date.now()
            }
        }
    }).then(function (user) {
        if (!user) {
            _module.render(req, res, 'reset-password', {
                msg: {
                    type: "error",
                    content: 'Password reset token is invalid or has expired'
                }
            });
        } else {
            _module.render(req, res, 'reset-password', {
                form: true
            });
        }
    });
};

_module.postReset = function (req, res) {
    let passwordDetails = req.body;
    let promises = __models.user.find({
        where: {
            id: req.params.userid,
            reset_password_token: req.params.token,
            reset_password_expires: {
                $gt: Date.now()
            }
        }
    }).then(function (user) {
        if (user) {
            if (passwordDetails.user_pass === passwordDetails.confirm_pass) {
                let data = {};
                data.user_pass = user.hashPassword(passwordDetails.user_pass);
                data.reset_password_token = '';
                data.reset_password_expires = null;

                return user.updateAttributes(data);
            } else {
                _module.render(req, res, 'reset-password.html', {
                    msg: {
                        type: "error",
                        content: "Passwords do not match"
                    },
                    form: true
                });
                return promises.cancel();
            }
        } else {
            _module.render(req, res, 'reset-password.html', {
                msg: {
                    type: "error",
                    content: "Password reset token is invalid or has expired"
                }
            });
            return promises.cancel();
        }
    }).then(function (user) {
        _module.getHTML(req, res, 'reset-password-confirm-email', {
            name: user.display_name,
            appName: config.app.title,
            site: 'http://' + req.headers.host,
            login_url: 'http://' + req.headers.host + '/user/signin'
        }, function (err, emailHTML) {
            let mailOptions = {
                to: user.user_email,
                from: config.mailer_config.mailer_from,
                subject: 'Your password has been changed',
                html: emailHTML
            };

            return sendMail(mailOptions).then(function (info) {
                return _module.render(req, res, 'reset-password.html', {
                    msg: {
                        content: 'Reset password successfully'
                    }
                });
            });
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        return next();
    });
};


_module.checkLogin = function (req, res, next) {
    if (req.user) {
        res.redirect(req.session.prelink || '/user/my-course');
    } else {
        next()
    }
};

_module.activateAccount = function (req, res) {
    __models.user.find({
        where: {
            id: req.params.userid
        }
    }).then(function (user) {
        if (!user) {
            return 'none';
        } else {
            if (user.user_activation_key == req.params.activate)
                return user.updateAttributes({
                    user_status: 'publish',
                    user_activation_key: ''
                });
            else return 'fail';
        }
    }).then(function (result) {
        if (result == 'none')
            req.msg = {
                type: 'error',
                content: 'Tài khoản chưa đăng ký với hệ thống'
            };
        else if (result == 'fail')
            req.msg = {
                type: 'error',
                content: 'Sai mã kích hoạt tài khoản/Tài khoản đã kích hoạt.'
            };
        else
            req.msg = {
                type: 'success',
                content: 'Bạn đã kích hoạt tài khoản thành công.'
            };
        return _module.render(req, res, 'sign', {msg: req.msg});
    })
};


_module.course = function (req, res) {
    if (req.user) {
        __models.user_course.findAll({
            where: {
                user_id: req.user.id
            }
        }).then(function (results) {
            if (results.length > 0) {
                promise.map(results, function (result) {
                    return __models.course.find(result.course_id);
                }).then(function (courses) {
                    _module.render(req, res, "courses", {courses: courses})
                })
            } else {
                _module.render(req, res, "courses", {courses: null});
            }
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        })
    } else {
        res.redirect('/khoa-hoc')
    }

};

_module.renderBill = function (req, res) {
    let id = req.params.cid;
    __models.customer_register.find(id).then(function (cg) {
        return new promise(function (fulfill, reject) {
            __models.course.find({
                where: {
                    id: cg.course_id
                },
                attributes: ['title']
            }).then(function (course) {
                fulfill([course.title, cg])
            }).catch(function (err) {
                reject(err);
            })
        })
    }).then(function (results) {
        _module.render(req, res, 'phieu-thu', {
            course_title: results[0],
            cg: results[1]
        })
    })
};

_module.getAvatarGallery = function (req, res) {
    readdirAsync(__base + 'public/' + req.body.root_path).then(function(files) {
        res.json(files);
    }).catch(function(err) {
        res.status(500).send(err.stack);
    })
};

_module.notify = function (req,res) {
    var user_id = req.user.id;
    if (user_id) {
        //__models.sequelize.query('Select cn.id,cn.title FROM (Select * from class_user where user_id = :id) uc INNER JOIN class_notification cn ON uc.class_id = cn.class_id ORDER BY cn.created_at desc LIMIT 10;',{replacements : {id : 71}}).then(function (result) {
        //    res.json(result[0]);
        //})
        __models.sequelize.query('Select * FROM list_notify(:user_id,1,10)',{replacements : { user_id : user_id}}).then(function (result) {
            _module.render(req,res,'details/notify',{data :result[0]})
        })
    } else {
        res.json('err');
    }

}

function sendMail(mailOptions) {
    return new Promise(function (fulfill, reject) {
        let transporter = mailer.createTransport(config.mailer_config);
        transporter.sendMail(mailOptions, function (err, info) {
            if (err !== null) {
                reject(err);
            } else {
                fulfill(info);
            }
        });
    });
}


module.exports = _module;
