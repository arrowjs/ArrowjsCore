"use strict";

module.exports = {
    name : "async",
    async :true,
    handler : function (func,cb) {
        console.log(func),
        cb(nul,true);
    }

}