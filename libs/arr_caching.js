"use strict";

let redis = require('redis').createClient();

module.exports = function () {
    let arr_cache = {};
    let valid_data = function (data) {
        if (typeof data != "string") {
            data = JSON.stringify(data);
        }
        return data;
    };
    arr_cache.set = function (key, data) {
        return redis.set(key, valid_data(data), redis.print);
    };
    arr_cache.setex = function (key, timeout, data) {
        return redis.setex(key, timeout, valid_data(data));
    };
    arr_cache.get = function (key) {
        return new Promise(function (done, reject) {
            redis.get(key, function (err, result) {
                if (err != null) {
                    return reject(err);
                }
                done(result);
            })
        });
    };

    arr_cache.del = function (key) {
        return redis.del(key);
    };

    arr_cache.keys = function () {
        return cache.keys();
    };

    arr_cache.values = function () {
        return cache.values();
    };

    arr_cache.has = function (key) {
        return cache.has(key);
    };

    arr_cache.peek = function (key) {
        return cache.peek(key);
    };

    arr_cache.reset = function () {
        return cache.reset();
    };

    arr_cache.config = function (options) {
        //cache = LRU(options);
    };

    return arr_cache;
};
