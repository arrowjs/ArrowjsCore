"use strict";

const getListFile = require('../helper/getListFile');
/**
 * Get action from file
 * @param setting
 * @param fatherPath
 * @param component
 * @param application
 */
module.exports = function actionAttribute(setting, fatherPath, component, application) {
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
    } else if (files.type === "multi") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                component.actions[key] = {};
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
                })
            }
        })
    }
};