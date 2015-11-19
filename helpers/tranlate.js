"use strict";
let util = require('util');

let lang = require("../libs/i18n");

/**
 * Translate function ;
 * @type {{__: Function}}
 */
module.exports = {
    "__" : function () {
        let self = this;
        let currentLang = self.getConfig("language");

        var args = Array.prototype.slice.call(arguments);
        args[0] = lang[currentLang][args[0]] || 'Undefined';
        return util.format.apply(util, args);
    }
};
