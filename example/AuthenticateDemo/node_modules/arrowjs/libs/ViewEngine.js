"use strict";
let __ = require('../libs/global_function');
module.exports = function (listViewFolder,viewEngineConfig) {
  return __.createNewEnv(listViewFolder,viewEngineConfig);
};