"use strict";

module.exports = function (component,application) {
    return {
        "/": {
            get : {
                handler: component.controllers.index,
                name : "hello"
            }
        },
        "/applicationRender": {
            get : {
                handler: component.controllers.applicationRender
            }
        },
        "/logout": {
            get : {
                handler: component.controllers.logout
            }
        }
    }
};