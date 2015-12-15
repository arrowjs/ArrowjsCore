"use strict";

/**
 * filter support call async function in template
 * @type {{name: string, async: boolean, handler: Function}}
 */
module.exports = {
    handler : function (data) {
        return JSON.stringify(data);
    }
};