'use strict';
const redis = require('redis'),
    bluebird = require('bluebird'),
    __ = require('./global_function'),
    logger = require("./logger");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


/**
 * If Redis server presents then create client to connect to it else create fakeRedis
 * @param config
 * @returns {Promise}
 */
module.exports = function (config) {
    let client = redis.createClient(config);

    /* istanbul ignore next */
    client.on('error', function (err) {
        logger.error(err.message);
    });
    return redis.createClient;
};

//return new Promise(function (fulfill, reject) {
//    let client = redis.createClient(config);
//    client.on('error', function (err) {
//        if(err) {
//            reject(err);
//        }
//        fulfill(fakeRedis.createClient)
//    });
//    client.on("ready", function () {
//        return fulfill(redis.createClient)
//    })
//})