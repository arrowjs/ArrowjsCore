"use strict";
const __ = require('./global_function');

/**
 * Create nunjucks environment.
 * @param listViewFolder
 * @param viewEngineConfig
 * @param application
 * @returns {Object}
 */
module.exports = function (listViewFolder,viewEngineConfig,application) {
  return __.createNewEnv(listViewFolder,viewEngineConfig,application);
};