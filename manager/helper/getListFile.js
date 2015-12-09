"use strict";
const __ = require('../../libs/global_function'),
     path = require('path');
/**
 * Get list file by glob
 * @param componentSetting
 * @param fatherPath
 * @param application
 * @returns {{}}
 */
module.exports = function getListFile(componentSetting, fatherPath, application) {
    let files = {};
    let componentPath = componentSetting.path;
    files.type = componentSetting.type;
    if(componentPath) {
        Object.keys(componentPath).map(function (id) {
            files[id] = [];
            componentPath[id].path.map(function (globByConfig) {
                let miniPath = globByConfig(application._config);
                let normalizePath;
                if (miniPath[0] === path.sep) {
                    normalizePath = path.normalize(application.arrFolder + path.sep + miniPath);
                } else {
                    normalizePath = path.normalize(fatherPath + path.sep + miniPath)
                }
                __.getGlobbedFiles(normalizePath).map(function (componentLink) {
                    files[id].push(componentLink);
                })
            })
        })
    };
    return files
};