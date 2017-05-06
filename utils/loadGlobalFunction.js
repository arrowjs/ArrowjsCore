'use strict';

const __ = require('../libs/global_function');
const _ = require('lodash');
const path = require('path');

/**
 * Load global functions then append to global.ArrowHelper
 * bind global function to ArrowApplication object so dev can this keyword in that function to refer
 * ArrowApplication object
 * @param self: ArrowApplication object
 */

module.exports = function loadingGlobalFunction(self) {
  __.getGlobbedFiles(path.resolve(__dirname, "..", "helpers/*.js")).map(function (link) {
    let arrowObj = require(link);
    Object.keys(arrowObj).map(function (key) {
      /* istanbul ignore else */
      if (_.isFunction(arrowObj[key])) {
        Arrow[key] = arrowObj[key].bind(self)
      } else {
        Arrow[key] = arrowObj[key]
      }
    })
  });
  __.getGlobbedFiles(path.normalize(__base + self._config.ArrowHelper + "*.js")).map(function (link) {
    let arrowObj = require(link);
    Object.keys(arrowObj).map(function (key) {
      if (_.isFunction(arrowObj[key])) {
        Arrow[key] = arrowObj[key].bind(self)
      } else {
        Arrow[key] = arrowObj[key]
      }
    })
  });
  return self
};