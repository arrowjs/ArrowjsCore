'use strict';
const _ = require('lodash');
const makeRender = require('./makeRender');

/**
 *
 * @param application
 * @param component
 * @param key
 * @returns {Function}
 */
module.exports = function overrideViewRender(application, component, key) {
  const componentName = component.name;
  const componentView = component.views;
  return function (req, res, next) {
    // Grab reference of render
    req.arrowUrl = key + "." + componentName;
    if (_.isArray(componentView)) {
      res.render = makeRender(req, res, application, componentView, componentName, component);
    } else {
      Object.keys(componentView).map(function (key) {
        res[key] = res[key] || {};
        res[key].render = makeRender(req, res, application, componentView[key], componentName, component[key]);
      });
      res.render = res[Object.keys(componentView)[0]].render
    }
    next();
  }
};