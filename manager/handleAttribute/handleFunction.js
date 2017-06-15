"use strict";

const pathAttribute = require('./path'),
    extendsAttribute = require('./extends'),
    modelAttribute = require('./model'),
    routeAttribute = require('./route'),
    viewAttribute = require('./view'),
    actionAttribute = require('./action'),
    controllerAttribute = require('./controller');
    //otherAttribute = require('./other');

/**
 * Get config by attribute of feature
 * @param attName - attribute name e.g "action"
 * @param component - component object e.g index {...}
 * @param fatherPath - absolute folder path to features e.g /home/username/projectname/features/index
 * @param application - ArrowApplication object
 * @returns {*}
 */
module.exports = function actionByAttribute(attName, component, fatherPath, application) {
    let setting = component._structure[attName]; // { path: { '0': { path: [Object] } }, type: 'single' }
    switch (attName) {
        case "path" :
            return pathAttribute();
        case "extend":
            return extendsAttribute(setting, application);
        case "model":
            return modelAttribute(setting, fatherPath, component, application);
        case "route":
            return routeAttribute(setting, fatherPath, component, application);
        case "view" :
            return viewAttribute(setting, fatherPath, component, application);
        case "action":
            return actionAttribute(setting, fatherPath, component, application);
        case "controller":
            return controllerAttribute(setting, fatherPath, component, application);
        default :
            return null;
    }
};