'use strict';

/**
 * Map final part of URL to equivalent functions in controller
 */
module.exports = function (component,application) {
    return {
        "/": {
            get: {
                handler: component.controllers.index
            }
        },
        "/about": {
            get: {
                handler : component.controllers.about
            }
        },
        "/contact": {
            get: {
                handler : component.controllers.contact
            }
        },
        "/post": {
            get: {
                handler : component.controllers.post
            }
        },
        "/change": {
            get: {
                handler : component.controllers.changeTheme
            }
        }
    };

};