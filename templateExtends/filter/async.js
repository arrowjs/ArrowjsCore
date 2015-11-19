"use strict";

/**
 * filter support call async function in template
 * @type {{name: string, async: boolean, handler: Function}}
 */
module.exports = {
    name : "async",
    async :true,
    handler : function (func,cb) {
        func(cb);
    }
};