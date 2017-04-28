'use strict';

/**
 * Map final part of URL to equivalent functions in controller
 */
module.exports = function (component,application) {
  return {
    "/{{name}}": {
      layout_template: true
    },
  }
};