"use strict";

module.exports = {
    t : function () {
        let self = this;
        return self._lang[self._config.language][key] || "undefined";
    }
};