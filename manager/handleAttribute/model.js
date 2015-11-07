"use strict";

let getListFile = require('../helper/getListFile');
let Database = require("../../libs/database");
let path = require('path');

module.exports = function modelAttribute(setting, fatherPath, component, application) {
    let files = getListFile(setting, fatherPath, application);
    let database = Database(application);
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    let model = database.import(path.resolve(link));
                    component.models[model.name] = model
                })
            }
        });
        Object.keys(component.models).forEach(function (modelName) {
            if ("associate" in component.models[modelName]) {
                component.models[modelName].associate(component.models)
            }
        });
    } else if (files.type === "multi") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                component.models[key] = {};
                files[key].map(function (link) {
                    let model = database.import(path.resolve(link));
                    component.models[key][model.name] = model
                });
                Object.keys(component.models[key]).forEach(function (modelName) {
                    if ("associate" in component.models[key][modelName]) {
                        component.models[key][modelName].associate(component.models[key])
                    }
                });
            }
        })
    }
};
