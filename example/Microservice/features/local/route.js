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
        "/local": {
            get : {
                handler: component.controllers.localCall
            }
        }
    }
};