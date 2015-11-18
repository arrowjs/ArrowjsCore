"use strict";
let __ = require('../libs/global_function');
module.exports = function (listViewFolder,viewEngineConfig,application) {
  return __.createNewEnv(listViewFolder,viewEngineConfig,application);
};