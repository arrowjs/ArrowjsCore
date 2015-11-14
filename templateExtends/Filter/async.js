"use strict";

module.exports = {
    name : "async",
    async :true,
    handler : function (func,cb) {
        func(cb);
    }
};