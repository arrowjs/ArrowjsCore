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
module.exports = function overrideViewRender(application, feature) {
  const featureName = feature.name;
  const featureView = feature.views;
  const featureType = feature.type;
  return function (req, res, next) {
    // Grab reference of render
    req.arrowUrl = featureType + "." + featureName;
    if (_.isArray(featureView)) {
      res.render = makeRender(req, res, application, featureView, featureName, feature);
    } else {
      Object.keys(featureView).map(function (key) {
        res[key] = res[key] || {};
        res[key].render = makeRender(req, res, application, featureView[key], featureName, feature[key]);
      });
      res.render = res[Object.keys(featureView)[0]].render
    }
    next();
  }
};