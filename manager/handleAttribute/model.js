"use strict";

let getListFile = require('../helper/getListFile');
let Database = require("../../libs/database");
let path = require('path');
let _ = require('lodash');

/**
 * Add model to application and component
 * @param setting
 * @param fatherPath
 * @param component
 * @param application
 */
module.exports = function modelAttribute(setting, fatherPath, component, application) {
    let files = getListFile(setting, fatherPath, application);
    let database = Database(application);

    application.models = application.models || {};
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    let model = database.import(path.resolve(link));
                    application.models[model.name] = model;
                    component.models[model.name] = model;
                })
            }
        });
    } else if (files.type === "multi") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                component.models[key] = {};
                files[key].map(function (link) {
                    let model = database.import(path.resolve(link));
                    component.models[key][model.name] = model;
                    application.models[model.name] = model;
                });
            }
        })
    }

};
