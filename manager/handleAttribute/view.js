"use strict";

let getListFunction = require('../helper/getListFunction');

module.exports = function viewAttribute(setting, fatherPath, component, application) {
    let functions = getListFunction(setting, fatherPath, application);
    if (functions.type === "single") {
        Object.keys(functions).map(function (key) {
            if (key !== "type") {
                functions[key].map(function (func) {
                    component.views.push(func);
                })
            }
        })
    } else if (functions.type === "multi") {
        component.views = {};
        Object.keys(functions).map(function (key) {
            if (key !== "type") {
                component.views[key] = [];
                functions[key].map(function (func) {
                    component.views[key].push(func);
                })
            }
        })
    }
}