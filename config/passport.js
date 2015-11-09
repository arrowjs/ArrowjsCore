'use strict';
/**
 * Module init function.
 */
module.exports = function (passport,application) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        application.models.user.findById(id, function (err, user) {
            done(err, user);
        });
    });
};