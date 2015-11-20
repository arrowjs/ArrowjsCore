"use strict";

module.exports = function (action,component,application) {
    action.index = function (data,cb) {
        cb(null, "hello");
    }
};