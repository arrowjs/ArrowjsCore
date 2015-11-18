"use strict";

let getListFile = require('../helper/getListFile');
/**
 * Get controller from file
 * @param setting
 * @param fatherPath
 * @param component
 * @param application
 */
module.exports = function controllerAttribute(setting, fatherPath, component, application) {
    let files = getListFile(setting, fatherPath, application);
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    let controllerFunction = require(link);
                    if (typeof controllerFunction !== "function") {
                        throw Error( link + " : is not a function");
                    } else {
                        try {
                            controllerFunction.call(null, component.controllers, component, application)
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
                component.controllers[key] = {};
                files[key].map(function (link) {
                    let controllerFunction = require(link);
                    if (typeof controllerFunction !== "function") {
                        throw Error( link + " : is not a function");
                    } else {
                        try {
                            controllerFunction.call(null, component.controllers[key], component, application)
                        } catch (err) {
                            throw err
                        }
                    }
                })
            }
        })
    }
};