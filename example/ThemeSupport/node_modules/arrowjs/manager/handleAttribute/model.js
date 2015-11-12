"use strict";

let getListFile = require('../helper/getListFile');
let Database = require("../../libs/database");
let path = require('path');

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
        Object.keys(component.models).forEach(function (modelName) {
            if ("associate" in component.models[modelName]) {
                let association = component.models[modelName].associate();
                if(typeof association === "object") {
                    Object.keys(association).map(function (key) {
                        if(component.models[key]) {
                            let relation = association[key].type;
                            if(typeof component.models[modelName][relation] === 'function') {
                                component.models[modelName][relation](component.models[key],association[key].option);
                            }
                        }
                        if(application.models[key]) {
                            let relation = association[key].type;
                            if(typeof application.models[modelName][relation] === 'function') {
                                application.models[modelName][relation](application.models[key],association[key].option);
                            }
                        }
                    })
                }
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
                Object.keys(component.models[key]).forEach(function (modelName) {
                    if ("associate" in component.models[key][modelName]) {
                        let association = component.models[key][modelName].associate();
                        if(typeof association === "object") {
                            Object.keys(association).map(function (key2) {
                                if(component.models[key][key2]) {
                                    let relation = association[key2].type;
                                    if(typeof component.models[key][modelName][relation] === 'function') {
                                        component.models[key][modelName][relation](component.models[key][key2],association[key2].option);
                                    }
                                }
                                if(application.models[key2]) {
                                    let relation = association[key2].type;
                                    if(typeof application.models[modelName][relation] === 'function') {
                                        application.models[modelName][relation](application.models[key2],association[key2].option);
                                    }
                                }
                            })
                        }

                    }
                });
            }
        })
    }
};
