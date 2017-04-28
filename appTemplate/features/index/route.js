'use strict';

/**
 * Map final part of URL to equivalent functions in controller
 */
module.exports = function (feature, application) {
    return {
        "/": {
            get : {
                handler: feature.controllers.index
            }
        },
    }
};