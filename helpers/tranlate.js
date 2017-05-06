"use strict";
let util = require('util');

/**
 * Translate function ;
 * @type {{__: Function}}
 */
module.exports = {
    "__" : function () {
        return global.__;
    }
};
