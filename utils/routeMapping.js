'use strict';

const _ = require('lodash');
const path = require('path');
const overrideViewRender = require('./overrideViewRender');

module.exports = function routerMapping(fatherPath, defaultRouteConfig, component, arrow, route, template, key) {

  const componentName = component.name;

  Object.keys(template).map(function (path_name) {
    //Check path_name
    /* istanbul ignore next */
    let routePath = path_name[0] === "/" ? path_name : "/" + componentName + "/" + path_name;
    routePath = fatherPath + routePath;
    //handle prefix
    /* istanbul ignore if */
    if (defaultRouteConfig.prefix && defaultRouteConfig.prefix[0] !== "/") {
      defaultRouteConfig.prefix = "/" + defaultRouteConfig.prefix
    }
    let prefix = defaultRouteConfig.prefix || "/";
    Object.keys(template[path_name]).map(function (method) {
      const routeInfo = template[path_name][method];
      if (routeInfo.name) {
        arrow._arrRoutes[routeInfo.name] = path.normalize(prefix + routePath);
      }
      //handle function
      let arrayHandler = [routeInfo.handler];

      arrayHandler.unshift(overrideViewRender(arrow, component, key));

      //Add to route
      if (method === "param") {
        if (_.isString(routeInfo.key) && !_.isArray(routeInfo.handler)) {
          return route.param(routeInfo.key, routeInfo.handler);
        }
      } else if (method === 'all') {
        return route.route(routePath)[method](arrayHandler);
      } else if (route[method] && ['route', 'use'].indexOf(method) === -1) {
        return route.route(routePath)[method](arrayHandler);
      } else {
        return false
      }
    });
    arrow.use(prefix, route)
  })
};