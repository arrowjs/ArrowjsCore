"use strict";

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
        cache = LRU(options);
    };

    return arr_cache;
};
