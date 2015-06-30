'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
    path = require('path'),
    redis = require('redis').createClient();
/**
 * Module init function.
 */
module.exports = function () {
    // Serialize sessions
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Deserialize sessions
    passport.deserializeUser(function (id, done) {
        let key = __config.redis_prefix + 'current-user-' + id;

        redis.get(key, function (err, result) {
            if (result != null) {
                let user = JSON.parse(result);
                done(null, user);
            }
            else {
                __models.user.find({
                    include: [__models.role],
                    where: {
                        id: id
                        //user_status: 'publish'
                    }
                }).then(function (user) {

                    let user_tmp = JSON.parse(JSON.stringify(user));
                    user_tmp.key = key;
                    user_tmp.acl = JSON.parse(user_tmp.role.rules);
                    redis.setex(key, 300, JSON.stringify(user_tmp));
                    done(null, user_tmp);
                }).catch(function (error) {
                    console.log(error.stack);
                });

            }
        });

    });

    // Initialize strategies
    __.getGlobbedFiles('./config/strategies/**/*.js').forEach(function (strategy) {
        require(path.resolve(strategy))();
    });
};