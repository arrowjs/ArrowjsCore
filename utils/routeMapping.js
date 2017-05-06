'use strict';
const makeHandlerChain = require('./makeHandlerChain');
const express = require('express');

module.exports = function routerMapping(feature, fatherPath, defaultRouteConfig, template) {
  const arrow = this;
  const featureName = feature.name;
  let route = express.Router();

  Object.keys(template).map(function (path_name) {
    //Check path_name
    let routePath = path_name[0] === "/" ? path_name : "/" + featureName + "/" + path_name;
    routePath = fatherPath + routePath;
    //handle prefix
    if (defaultRouteConfig.prefix && defaultRouteConfig.prefix[0] !== "/") {
      defaultRouteConfig.prefix = "/" + defaultRouteConfig.prefix
    }
    let prefix = defaultRouteConfig.prefix || "/";
    Object.keys(template[path_name]).map(function (method) {
      const routeInfo = template[path_name][method];
      return makeHandlerChain.call(arrow, feature, route, routePath, routeInfo, method)
    });
    arrow.use(prefix, route);
  })
};