'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = function () {
    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function (username, password, done) {
            __models.user.find({
                where: [
                    "(lower(user_login) = ? or lower(user_email) = ?) and user_status='publish'", username.toLowerCase(), username.toLowerCase()
                ]

            }).then(function (user, err) {

                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Username or password invalid'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Username or password invalid'
                    });
                }
                return done(null, user);

            });

        }
    ));
};