'use strict';
var session = require('express-session'),
    redis = require('redis').createClient(),
    RedisStore = require('connect-redis')(session);

let secret = "helloArrowCMS";

module.exports = session({
    store: new RedisStore({host: __config.redis.host, port: __config.redis.port, client: redis , prefix : 'sess:'}),
    secret: secret,
    key: 'sid',
    resave: true,
    saveUninitialized: true,
    cookie : {
        httpOnly: true
    }
});