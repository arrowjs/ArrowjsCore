"use strict";

const getListFile = require('../helper/getListFile'),
    _ = require('lodash');
/**
 * Get action from file
 * @param setting
 * @param fatherPath
 * @param component
 * @param application
 */
module.exports = function actionAttribute(setting, fatherPath, component, application) {
    application.actions = application.actions || {};
    application.actions[component.name] = {};
    let files = getListFile(setting, fatherPath, application);
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    let actionFunction = require(link);
                    if (typeof actionFunction !== "function") {
                        throw Error( link + " : is not a function");
                    } else {
                        try {
                            actionFunction.call(null, component.actions, component, application)
                        } catch (err) {
                            throw err
                        }
                    }
                })
            }
        })
        _.assign(application.actions[component.name],component.actions);
    } else  {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                component.actions[key] = {};
                application.actions[component.name][key] = {};
                files[key].map(function (link) {
                    let actionFunction = require(link);
                    if (typeof actionFunction !== "function") {
                        throw Error( link + " : is not a function");
                    } else {
                        try {
                            actionFunction.call(null, component.actions[key], component, application)
                        } catch (err) {
                            throw err
                        }
                    }
                });
                _.assign(application.actions[component.name][key],component.actions[key]);
            }
        })
    }
};