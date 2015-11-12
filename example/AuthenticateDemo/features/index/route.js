'use strict';

module.exports = function (component,application) {
    return  {
        "/login" : {
            get : {
                handler : component.controllers.loginView
            },
            post : {
                authenticate: 'local1'
            }
        },
        "/create" : {
            get : {
                handler : component.controllers.createView
            },
            post : {
                handler : component.controllers.create
            }
        },
        "/" : {
            get : {
                handler : component.controllers.index,
                authenticate : true
            }
        }
    }
};