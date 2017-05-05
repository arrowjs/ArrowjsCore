'use strict';
const _ = require('lodash');

module.exports = function getDataByDotNotation(obj, key) {
  if (_.isString(key)) {
    if (key.indexOf(".") > 0) {
      let arrayKey = key.split(".");
      let self = obj;
      let result = null;
      arrayKey.map(function (name) {
        if (self[name]) {
          result = self[name];
          self = result;
        } else {
          result = null
        }
      });
      return result
    } else {
      return obj[key];
    }
  } else {
    return null
  }
};