"use strict";

/**
 * Add extends to feature
 * @param setting
 * @param application
 * @returns {{}}
 */
module.exports = function extendsAttribute(setting,application) {
    let newSetting = {};
    Object.keys(setting).map(function (key) {
        if (typeof setting[key] === 'function') {
            newSetting[key] = setting[key].bind(application);
        }else {
            newSetting[key] = setting[key]
        }
    });
    return newSetting
};