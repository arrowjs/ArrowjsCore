'use strict';

const express = require('express');
const path = require('path');
const _ = require('lodash');

const routerMapping = require('./routeMapping');
const overrideViewRender = require('./overrideViewRender');
const handleRole = require('./handleRole');
const handleAuthenticate = require('./handleAuthenticate');
/**
 *
 * @param arrow
 * @param componentRouteSetting
 * @param defaultRouteConfig
 * @param key
 * @param setting
 * @param componentKey
 */
module.exports = function handleComponentRouteSetting(arrow, componentRouteSetting, defaultRouteConfig, key, setting, componentKey) {
  let component = arrow[key][componentKey];
  let componentName = arrow[key][componentKey].name;
  let viewInfo = arrow[key][componentKey].views;
  //Handle Route Path;
  let route = express.Router();
  route.componentName = componentName;
  Object.keys(componentRouteSetting).map(function (path_name) {
    //Check path_name
    /* istanbul ignore next */
    let routePath = path_name[0] === "/" ? path_name : "/" + componentName + "/" + path_name;
    //handle prefix
    /* istanbul ignore if */
    if (defaultRouteConfig.prefix && defaultRouteConfig.prefix[0] !== "/") {
      defaultRouteConfig.prefix = "/" + defaultRouteConfig.prefix
    }
    let prefix = defaultRouteConfig.prefix || "/";

    let arrayMethod = Object.keys(componentRouteSetting[path_name]).filter(function (method) {
      //handle template route
      if (method === 'template') {
        const template = componentRouteSetting[path_name][method];
        return routerMapping(routePath, defaultRouteConfig, component, arrow, route, template, key)
      }

      const routeInfo = componentRouteSetting[path_name][method];
      if (routeInfo.name) {
        arrow._arrRoutes[routeInfo.name] = path.normalize(prefix + routePath);
      }
      //handle function
      let routeHandler;
      const defaultHandler = function (req, res, next) {
        next(new Error("Invalid controller"));
      };

      routeHandler = routeInfo.handler;

      // let authenticate = routeInfo.authenticate !== undefined ?
      //   routeInfo.authenticate : defaultRouteConfig.authenticate;
      // if (!_.isString(authenticate) || !_.isBoolean(authenticate)) {
      //   return false
      // }

      //Setting base Handler
      let arrayHandler = [];
      if (_.isArray(routeHandler)) {
        arrayHandler = routeHandler.filter(_.isFunction);
      } else if (_.isFunction(routeHandler)) {
        arrayHandler.push(routeHandler)
      } else {
        arrayHandler.push(defaultHandler)
      }

      //Add viewRender
      if (!_.isEmpty(viewInfo)) {
        arrayHandler.unshift(overrideViewRender(arrow, component, key))
      }

      //handle role
      //TODO: need new RBAC
      if (setting && setting.role) {
        let permissions = routeInfo.permissions;
        if (permissions) {
          arrayHandler.unshift(arrow.passportSetting.handlePermission);
          arrayHandler.unshift(handleRole(permissions, componentName, key))
        }
      }

      //add middleware after authenticate;
      if (!_.isEmpty(arrow.afterAuth)) {
        arrow.afterAuth.map(function (func) {
          arrayHandler.unshift(func)
        })
      }

      //handle Authenticate
      if (setting && setting.passport) {
        if (authenticate) {
          arrayHandler.unshift(handleAuthenticate(arrow, authenticate))
        }
      }

      //add middleware before authenticate;
      if (!_.isEmpty(arrow.beforeAuth)) {
        arrow.beforeAuth.map(function (func) {
          arrayHandler.unshift(func)
        })
      }

      //Add to route
      if (method === "param") {
        if (_.isString(routeInfo.key) && !_.isArray(routeInfo.handler)) {
          return route.param(routeInfo.key, routeInfo.handler);
        }
      } else if (method === 'all') {
        return route.route(routePath)
          [method](arrayHandler);
      } else if (route[method] && ['route', 'use'].indexOf(method) === -1) {
        if (routeInfo.order) {
          let newRoute = express.Router();
          newRoute.componentName = componentName;
          newRoute.order = routeInfo.order;
          newRoute.route(routePath)[method](arrayHandler);
          return arrow.use(prefix, newRoute)
        }
        return route.route(routePath)[method](arrayHandler)
      } else {
        return false
      }
    });
    !_.isEmpty(arrayMethod) && arrow.use(prefix, route);
  });
  return arrow
};