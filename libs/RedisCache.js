"use strict";

let redis = require('redis');
let bluebird = require('bluebird');
let __ = require('./global_function');
let fakeRedis = require("fakeredis");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

bluebird.promisifyAll(fakeRedis.RedisClient.prototype);
bluebird.promisifyAll(fakeRedis.Multi.prototype);

//TODO: How to check system have redis and change use another solution;
module.exports = redis.createClient;