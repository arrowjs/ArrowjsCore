"use strict";

let pathAttribute = require('./path');
let extendsAttribute = require('./extends');
let modelAttribute = require('./model');
let routeAttribute = require('./route');
let viewAttribute = require('./view');
let helperAttribute = require('./helper');
let controllerAttribute = require('./controller');
let otherAttribute = require('./other');

module.exports = function actionByAttribute(attName, component, fatherPath, application) {
    let setting = component._structure[attName];
    switch (attName) {
        case "path" :
            return pathAttribute();
        case "extends":
            return extendsAttribute(setting);
        case "model":
            return modelAttribute(setting, fatherPath, component, application);
        case "route":
            return routeAttribute(setting, fatherPath, component, application);
        case "view" :
            return viewAttribute(setting, fatherPath, component, application);
        case "helper":
            return helperAttribute(setting, fatherPath, component, application);
        case "controller":
            return controllerAttribute(setting, fatherPath, component, application);
        default :
            return otherAttribute(setting, attName, component);
    }
};