'use strict';

module.exports = function (component,application) {
    return  {
        "/index" : {
            get : {
                handler : component.controllers.index,
                role : 'index'
            }
        },
        "/about" : {
            get : {
                handler : component.controllers.about,
                role : 'about'
            }
        },
        "/post" : {
            get : {
                handler : component.controllers.post,
                role : 'post'
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