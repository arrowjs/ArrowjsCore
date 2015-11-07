"use strict";

let getListFolder = require('../helper/getListFile');

module.exports = function viewAttribute(setting, fatherPath, component, application) {
    let folders = getListFolder(setting, fatherPath, application);
    if (folders.type === "single") {
        Object.keys(folders).map(function (key) {
            if (key !== "type") {
                folders[key].map(function (link) {
                    component.views.push(link);
                })
            }
        })
    } else if (folders.type === "multi") {
        component.views = {};
        Object.keys(folders).map(function (key) {
            if (key !== "type") {
                component.views[key] = [];
                folders[key].map(function (link) {
                    component.views[key].push(link);
                })
            }
        })
    }
}