"use strict";
let __ = require('../libs/global_function');
module.exports = function (listViewFolder,viewEngineConfig) {
  let viewEnv = __.createNewEnv(listViewFolder,viewEngineConfig);

  return viewEnv
};