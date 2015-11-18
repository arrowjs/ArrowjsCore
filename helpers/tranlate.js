"use strict";
let util = require('util');
/**
 * Export global functions
 * @type {{__: Function}}
 */
module.exports = {
    "__" : function () {
        let self = this;
        let currentLang = self.getConfig("language");

        var args = Array.prototype.slice.call(arguments);
        args[0] = self._lang[currentLang][args[0]] || 'Undefined';
        return util.format.apply(util, args);
    }
};
