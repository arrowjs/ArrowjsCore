'use strict'
/**
 * Created by thanhnv on 3/11/15.
 */
let passport = require('passport');
let _ = require('lodash');
let config = require(__base + 'config/config.js');

let mailer = require('nodemailer');

let promise = require('bluebird');
let randomBytesAsync = promise.promisify(require('crypto').randomBytes);
let env = __.createNewEnv(__dirname + '/views_layout');
let render = function (req, res, view, options, fn) {
    res.locals.messages = req.session.messages;
    req.session.messages = [];

    if (view.indexOf('.html') == -1) {
        view += '.html';
    }

    if (fn) {
        env.render(view, _.assign(res.locals, options), fn);
    } else {
        env.render(view, _.assign(res.locals, options), function (err, re) {
            res.send(re);
        });
    }
};

module.exports = function (app) {
    app.route('/admin/login').get(function (req, res) {
        if (req.isAuthenticated()) {
            return res.redirect('/admin');
        } else {
            render(req, res, 'login.html');
        }
    }).post(function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            // Remove sensitive data before login
            if (user)
                user.user_pass = undefined;

            if (info) {
                req.flash.error(info.message);
                return render(req, res, 'login.html');
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        return res.redirect('/admin');
                    }
                });
            }
        })(req, res, next);
    });

    app.route('/admin/forgot-password').get(function (req, res) {
        render(req, res, 'forgot-password.html');
    }).post(function (req, res, next) {
        if (!req.body.email) {
            req.flash.warning('Email is required');
            return render(req, res, 'forgot-password.html');
        }

        let token = '';

        // Generate random token
        let promises = randomBytesAsync(20).then(function (buffer) {
            token = buffer.toString('hex');

            // Lookup user by user_email
            return __models.user.find({
                where: 'user_email=\'' + req.body.email + '\''
            });
        }).then(function (user) {
            if (!user) {
                req.flash.warning('No account with that email has been found');
                render(req, res, 'forgot-password.html');
                return promises.cancel();
            } else {
                // Block spam
                let time = Date.now() + 3600000; // 1 hour

                if (user.reset_password_expires != null) {
                    if (time - user.reset_password_expires < 900000) // 15 minutes
                    {
                        let min = 15 - Math.ceil((time - user.reset_password_expires) / 60000);
                        req.flash.warning('An reset password email has already been sent. Please try again in ' + min + ' minutes.');
                        render(req, res, 'reset-password.html');
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
            render(req, res, 'email-templates/reset-password-email', {
                name: user.display_name,
                appName: config.app.title,
                url: 'http://' + req.headers.host + '/admin/reset/' + user.id + '/' + token
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

                    return __.sendMail(mailOptions).then(function (info) {
                        req.flash.success('An email has been sent to ' + user.user_email + ' with further instructions. Please follow the guide in email to reset password');
                        return render(req, res, 'reset-password');
                    });
                }
            });
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            return next();
        });
    });

    app.route('/admin/reset/:userid/:token').get(function (req, res, next) {
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
                req.flash.error('Password reset token is invalid or has expired');
                return render(req, res, 'reset-password.html');
            } else {
                return next();
            }
        });
    }, function (req, res) {
        render(req, res, 'reset-password.html', {
            form: true
        });
    }).post(function (req, res) {
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
                if (passwordDetails.newpassword === passwordDetails.retype_password) {
                    let data = {};
                    data.user_pass = user.hashPassword(passwordDetails.newpassword);
                    data.reset_password_token = '';
                    data.reset_password_expires = null;

                    return user.updateAttributes(data);
                } else {
                    req.flash.warning('Passwords do not match');
                    render(req, res, 'reset-password.html', {form: true});
                    return promises.cancel();
                }
            } else {
                req.flash.warning('Password reset token is invalid or has expired');
                render(req, res, 'reset-password.html');
                return promises.cancel();
            }
        }).then(function (user) {
            render(req, res, 'email-templates/reset-password-confirm-email', {
                name: user.display_name,
                appName: config.app.title,
                site: 'http://' + req.headers.host,
                login_url: 'http://' + req.headers.host + '/admin/login'
            }, function (err, emailHTML) {
                let mailOptions = {
                    to: user.user_email,
                    from: config.mailer_config.mailer_from,
                    subject: 'Your password has been changed',
                    html: emailHTML
                };

                return __.sendMail(mailOptions).then(function (info) {
                    req.flash.success('Reset password successfully');
                    return render(req, res, 'reset-password.html');
                });
            });
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            return next();
        });
    });

    app.use('/admin/*', function (req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/admin/login');
        }

        if (req.user && req.user.role_id === 21) {
            return res.redirect('/');
        }

        next();
    });

    // Error in backend
    app.route('/admin/err/500').get(function (req, res) {
        render(req, res, '500.html');
    });

    app.route('/admin/err/404').get(function (req, res) {
        render(req, res, '404.html');
    });
};
