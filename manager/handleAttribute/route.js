"use strict";

const getListFile = require('../helper/getListFile'),
    _ = require('lodash');

/**
 * Get all route.
 * @param setting
 * @param fatherPath
 * @param component
 * @param application
 */
module.exports = function routeAttribute(setting, fatherPath, component, application) {
    let files = getListFile(setting, fatherPath, application);
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    let routeFunction = require(link);
                    if (typeof routeFunction === "function") {
                        try {
                            let routeConfig = routeFunction.call(null, component, application);
                            _.assign(component.routes, routeConfig);
                        } catch (err) {
                            throw err
                        }
                    }
                })
            }
        })
    } else {
        Object.keys(files).map(function (key) {
            component.routes[key] = {};
            if (key !== "type") {
                files[key].map(function (link) {
                    let routeFunction = require(link);
                    if (typeof routeFunction === "function") {
                        try {
                            let routeConfig = routeFunction.call(null, component, application);
                            _.assign(component.routes[key], routeConfig);
                        } catch (err) {
                            throw err
                        }
                    }
                })
            }
        })
    }
}