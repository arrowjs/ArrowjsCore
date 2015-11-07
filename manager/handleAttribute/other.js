"use strict";

module.exports = function otherAttribute(setting, attName, component) {
    let obj = Object.create(null);
    if (typeof setting === "function") {
        obj[attName] = setting.bind(component);
    } else {
        obj[attName] = setting;
    }
    return obj
}
