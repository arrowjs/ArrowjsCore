"use strict";
let __ = require('../../libs/global_function');
let path = require('path');

module.exports = function getListFile(componentSetting, fatherPath, application) {
    let files = {};
    let componentPath = componentSetting.path;
    files.type = componentSetting.type;
    if (componentPath) {
        Object.keys(componentPath).map(function (id) {
            files[id] = [];
            componentPath[id].path.map(function (globByConfig) {
                let miniPath = globByConfig(application._config);
                let normalizePath;
                if (miniPath[0] === "/") {
                    normalizePath = path.normalize(application.arrFolder + "/" + miniPath);
                } else {
                    normalizePath = path.normalize(fatherPath + "/" + miniPath)
                }
                __.getGlobbedFiles(normalizePath).map(function (componentLink) {
                    files[id].push(componentLink);
                })
            })
        });
    }
    return files
}