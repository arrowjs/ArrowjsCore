"use strict";
let __ = require('../libs/global_function');
module.exports = function (listViewFolder) {
  let viewEnv = __.createNewEnv(listViewFolder);

  return viewEnv
};