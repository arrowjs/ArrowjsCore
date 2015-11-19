"use strict";

/**
 * function get ArrowConfig in template
 * @type {{name: string, handler: Function}}
 */
module.exports = {
    name : 'getConfig',
    handler : function (key) {
        return this.getConfig(key)
    }
};