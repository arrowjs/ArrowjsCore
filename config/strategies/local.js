'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = function (application) {
    // Use local strategy
    passport.use(new LocalStrategy(
        function (username, password, done) {
            application.models.user.find({
                where : {
                    username : username
                }
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {message: 'Incorrect username or password.'});
                }
                if (!user.validPassword(password)) {
                    return done(null, false, {message: 'Incorrect username or password.'});
                }
                return done(null, user);
            });
        }
    ));
};