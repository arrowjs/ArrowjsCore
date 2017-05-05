"use strict";
const pluralize = require('pluralize');

/**
 * filter support call async function in template
 * @type {{name: string, async: boolean, handler: Function}}
 */
module.exports = {
  handler : function (data) {
    return pluralize(data);
  }
};