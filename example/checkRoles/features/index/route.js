'use strict';

module.exports = function (component,application) {
    return  {
        "/index" : {
            get : {
                handler : component.controllers.index,
                permissions : 'index'
            }
        },
        "/about" : {
            get : {
                handler : component.controllers.about,
                permissions : 'about'
            }
        },
        "/post" : {
            get : {
                handler : component.controllers.post,
                permissions : 'post'
            }
        },
        "/" : {
            get : {
                handler : component.controllers.role
            },
            post : {
                handler : component.controllers.rolePost
            }
        }
    }
};