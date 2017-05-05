'use strict';
const _ = require('lodash');

module.exports = function addConfig(obj) {
  let config = this._config;
  if (_.isObject(obj)) {
    _.assign(config, obj);
  }
};
