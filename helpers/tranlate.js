"use strict";

module.exports = {
    t : function (key) {
        let self = this;
        return self._lang[self._config.language][key] || "undefined";
    }
};
