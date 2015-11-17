"use strict";

module.exports = {
    "__" : function (key) {
        let self = this;
        return self._lang[self._config.language][key] || "undefined";
    }
};
