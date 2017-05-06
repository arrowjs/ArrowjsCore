'use strict';

const express = require('express');
const _ = require('lodash');

const routerMapping = require('./routeMapping');
const makeHandlerChain = require('./makeHandlerChain');
/**
 *
 * @param componentName
 * @param featureName
 * @param subName
 */
module.exports = function makeRoute(componentName, featureName, subName) {
  const arrow = this;
  const feature = arrow[componentName][featureName];
  const routeConfig = feature._structure.route;
  const defaultRoute = routeConfig.path[subName];
  const featureRoutes = subName !== '0' ? feature.routes[subName] : feature.routes;
  const featureConfigName = feature.name;
  //Handle Route Path;
  let route = express.Router();
  route.featureName = featureConfigName;
  Object.keys(featureRoutes).map(function (path_name) {
    //Check path_name
    const routePath = path_name[0] === "/" ? path_name : "/" + featureConfigName + "/" + path_name;
    //handle prefix
    (defaultRoute.prefix && defaultRoute.prefix[0] !== "/") && (defaultRoute.prefix = "/" + defaultRoute.prefix)

    const prefix = defaultRoute.prefix || "/";

    let arrayMethod = Object.keys(featureRoutes[path_name]).filter(function (method) {
      //handle template route
      if (method === 'template') {
        const template = featureRoutes[path_name][method](feature);
        routerMapping.call(arrow, feature, routePath, defaultRoute, template)
        return false
      }
      const routeInfo = featureRoutes[path_name][method];

      return makeHandlerChain.call(arrow, feature, route, routePath, routeInfo, method)
    });
    !_.isEmpty(arrayMethod) && arrow.use(prefix, route);
  });
  return arrow
};