/**
 * Created by trquoccuong on 5/5/2017.
 */
'use strict';
const path = require('path');

/**
 *
 * @param obj
 * @param application
 * @param componentName
 * @returns {*}
 */
module.exports = function handleView(obj, application, componentName) {
  let miniPath = obj.func(application._config, componentName);
  let normalizePath;
  if (miniPath[0] === path.sep) {
    normalizePath = path.normalize(obj.base + path.sep + miniPath);
  } else {
    normalizePath = path.normalize(obj.fatherBase + path.sep + miniPath)
  }
  return normalizePath
};
