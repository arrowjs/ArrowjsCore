"use strict";
const path = require('path');

/**
 * Get list folder from structure
 * @param componentSetting
 * @param fatherPath
 * @param application
 * @returns {{}}
 */
module.exports = function getListFolder(componentSetting, fatherPath, application) {
    let folders = {};
    let componentPath = componentSetting.path;
    folders.type = componentSetting.type;
    if (componentPath) {
        Object.keys(componentPath).map(function (id) {
            folders[id] = [];
            componentPath[id].path.map(function (globByConfig) {
                let miniPath = globByConfig(application._config);
                let normalizePath;
                if (miniPath[0] === path.sep) {
                    normalizePath = path.normalize(application.arrFolder + path.sep + miniPath);
                } else {
                    normalizePath = path.normalize(fatherPath + path.sep + miniPath)
                }
                folders[id].push(normalizePath);
            })
        });
    }
    return folders
};