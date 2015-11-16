"use strict";

module.exports = {
    name : 'getConfig',
    handler : function (key) {
        return this.getConfig(key)
    }
};