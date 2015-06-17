/**
 * Created by thanhnv on 6/1/15.
 */
"use strict"

let LRU = require("lru-cache"),
    cache = LRU({
        maxAge: 1000 * 60 * 60
    });

module.exports = function () {
    let arr_cache = {};
    arr_cache.set = function (key, data) {
        return cache.set(key, data);
    };
    arr_cache.get = function (key) {
        return cache.get(key);

    };
    arr_cache.del = function (key) {
        return cache.del(key);
    };
    arr_cache.config = function (options) {
        cache = LRU(options);
    };
    return arr_cache;
}
