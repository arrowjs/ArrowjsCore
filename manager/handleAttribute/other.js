"use strict";

/**
 * handle if user add other setting
 * @param setting
 * @param attName
 * @param component
 * @returns {Object}
 */
module.exports = function otherAttribute(setting, attName, component) {
    let obj = Object.create(null);
    if (typeof setting === "function") {
        obj[attName] = setting.bind(component);
    } else {
        obj[attName] = setting;
    }
    return obj
};
