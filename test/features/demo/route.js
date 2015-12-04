"use strict";

module.exports = function (component,application) {
    return {
        "/": {
            get : {
                handler: component.controllers.index,
                name : "hello",
                order : 3
            }
        },
        "/enableWebsocketCluster": {
            get : {
                handler: component.controllers.enableWebsocketCluster,
                order : 1
            }
        },
        "/linkto": {
            get : {
                handler: component.controllers.linkto,
                order : 1
            }
        },
        "/applicationRender": {
            get : {
                handler: component.controllers.applicationRender,
                order : 2
            }
        },
        "/logout": {
            get : {
                handler: component.controllers.logout
            }
        }
    }
};