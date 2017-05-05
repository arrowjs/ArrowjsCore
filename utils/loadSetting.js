'use strict';
const _ = require('lodash');
const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');

module.exports = function loadSetting(des, source) {
  let baseFolder = this.arrFolder;
  let setting = {};
  let filePath = path.normalize(baseFolder + des);
  try {
    fs.accessSync(filePath);
    _.assign(setting, require(filePath));
  } catch (err) {
    if (err.code === 'ENOENT') {
      fsExtra.copySync(path.resolve(source), filePath);
      _.assign(setting, require(filePath));
    } else {
      throw err
    }

  }
  return setting;
}