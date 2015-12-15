"use strict";
const path = require('path');
/**
 * Get list function from structure
 * @param componentSetting
 * @param fatherPath
 * @param application
 * @returns {{}}
 */
module.exports = function getListFunction(componentSetting, fatherPath, application) {
    let functions = {};
    let componentPath = componentSetting.path;
    functions.type = componentSetting.type;
    if (componentPath) {
        Object.keys(componentPath).map(function (id) {
            functions[id] = [];
            componentPath[id].path.map(function (globByConfig) {
                let miniFunction = {};
                miniFunction.func = globByConfig;
                miniFunction.base = application.arrFolder;
                miniFunction.fatherBase = fatherPath;
                functions[id].push(miniFunction);
            })
        })
    };
    return functions
};