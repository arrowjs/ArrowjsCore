'use strict';

/**
 * Map final part of URL to equivalent functions in controller
 */
module.exports = function (component,application) {
    return {
        "/": {
            get : {
                handler: component.controllers.index
            }
        },
        "/about": {
            get: {
                handler : component.controllers.about
            }
        },
        "/repos" : {
            get : {
                handler : component.controllers.repos
            }
        },
        "/raw" : {
            get : {
                handler : component.controllers.raw
            }
        }

    }
};