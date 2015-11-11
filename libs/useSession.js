"use strict";
var session = require('express-session'),
    RedisStore = require('connect-redis')(session);

module.exports = function useSession() {
    let app = this;
    let sessionConfig = require(app.arrFolder + 'config/session');
    if(app.arrConfig.redis.type !== "fakeredis") {
        sessionConfig.store = sessionConfig.store || new RedisStore({
            host: app.arrConfig.redis.host,
            port: app.arrConfig.redis.port,
            client: app.redisClient,
            prefix: sessionConfig.redis_prefix || 'sess:'
        })
    }

    app.use(session(sessionConfig));

    //app.use(function (req, res, next) {
    //    if (!req.session) {
    //        return next(new Error('Session destroy')); // handle error
    //    }
    //    next(); // otherwise continue
    //});
};