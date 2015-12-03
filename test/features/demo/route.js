"use strict";

module.exports = function (component,application) {
    return {
        "/": {
            get : {
                handler: component.controllers.index,
                name : "hello",
                order : 1
            }
        },
        "/enableWebsocketCluster": {
            get : {
                handler: component.controllers.enableWebsocketCluster
            }
        },
        "/linkto": {
            get : {
                handler: component.controllers.linkto
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