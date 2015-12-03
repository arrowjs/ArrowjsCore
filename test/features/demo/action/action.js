"use strict";

module.exports = function (action,component,application) {
    action.defaultAction = function () {
       return 1
    };
    action.callbackAction = function (cb) {
        cb(1)
    };
    action.wrongAction = {};
};