"use strict";

module.exports = function (component,application) {
    return {
        "/": {
            get : {
                handler: component.controllers.backend.index
            }
        }
    }
};