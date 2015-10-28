"use strict";

let redis = require('redis');
let bluebird = require('bluebird');
let __ = require('./global_function');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
//let rawConfig = __.getRawConfig();
//let redisConfig = rawConfig.redis || {};

module.exports = redis.createClient;