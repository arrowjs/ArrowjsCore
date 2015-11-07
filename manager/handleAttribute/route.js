"use strict";

let getListFile = require('../helper/getListFile');
let Express = require('express');

module.exports = function routeAttribute(setting, fatherPath, component, application) {
    let files = getListFile(setting, fatherPath, application);
    if (files.type === "single") {
        Object.keys(files).map(function (key) {
            if (key !== "type") {
                files[key].map(function (link) {
                    let routeFunction = require(link);
                    if (typeof routeFunction !== "function") {
                        throw Error( link + " : is not a function");
                    } else {
                        try {
                            routeFunction.call(null, component.routes, component, application)
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
                component.routes[key] = Express.Router();
                files[key].map(function (link) {
                    let routeFunction = require(link);
                    if (typeof routeFunction !== "function") {
                        throw Error( link + " : is not a function");
                    } else {
                        try {
                            routeFunction.call(null, component.routes[key], component, application);
                        } catch (err) {
                            throw err
                        }
                    }
                })
            }
        })
    }
}